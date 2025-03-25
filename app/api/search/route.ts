import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { neon } from "@neondatabase/serverless";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const db = neon(process.env.DATABASE_URL!);

async function fetchWithTimeout(url: string, options = {}, timeout = 2000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch {
    return null;
  }
}

async function isImageValid(url: string, timeout = 1000) {
  try {
    if (url.includes("facebook.com/tr") || url.includes("google-analytics") || url.includes("lookaside.fbsbx.com")) {
      return false;
    }
    if (!url.match(/\.(jpeg|jpg|png|webp|gif|svg)$/i)) return false;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { method: "GET", headers: { Range: "bytes=0-99" }, signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok && res.status !== 404;
  } catch {
    return false;
  }
}

async function fetchImageFromPage(url: string) {
  const res = await fetchWithTimeout(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res) return null;

  const html = await res.text();
  const regexList = [
    /<meta property="og:image" content="([^"]+)"/,
    /<meta name="twitter:image" content="([^"]+)"/,
    /<img[^>]+src=["']([^"']+)["']/g,
  ];

  for (const regex of regexList) {
    const matches = regex.global ? [...html.matchAll(regex)].map(m => m[1]) : [html.match(regex)?.[1]];
    for (const match of matches) if (match && await isImageValid(match)) return match;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message) throw new Error("Missing message in request.");

    const userId = req.cookies.get("userId")?.value;
    const isLoggedIn = !!userId;

    const { GOOGLE_API_KEY, CUSTOM_SEARCH_ENGINE_ID } = process.env;
    if (!GOOGLE_API_KEY || !CUSTOM_SEARCH_ENGINE_ID) throw new Error("Missing API keys");

    console.time("Google Search");
    const searchResponse = await fetchWithTimeout(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${CUSTOM_SEARCH_ENGINE_ID}&q=${encodeURIComponent(message)}&sort=date&fields=items(title,link,snippet,pagemap(cse_image),pagemap(metatags))&num=5`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
      2000
    );
    if (!searchResponse) throw new Error("Google search timed out");
    if (!searchResponse.ok) throw new Error("Failed to fetch search results");
    const googleData = await searchResponse.json();
    console.timeEnd("Google Search");

    let searchResults = [
      ...(googleData.items || []).map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link,
        image: item.pagemap?.cse_image?.[0]?.src || null,
        source: "Google",
        date: item.pagemap?.metatags?.[0]?.["article:published_time"] || null,
      })),
    ];

    const seenLinks = new Set();
    searchResults = searchResults.filter((item) => {
      if (seenLinks.has(item.link)) return false;
      seenLinks.add(item.link);
      return true;
    });

    if (!searchResults.length) {
      return NextResponse.json({ message: "Hmm, we couldn’t find anything with that.", searchResults: [], suggestions: [] });
    }

    const currentDate = new Date();
    searchResults = searchResults.map((item) => {
      const eventDateString = item.date || null;
      const isPastEvent = eventDateString && new Date(eventDateString) < currentDate;
      if (isPastEvent) item.snippet = `${item.snippet} (Event has already occurred)`;
      return item;
    });

    searchResults.sort((a, b) => (a.date && b.date ? new Date(b.date).getTime() - new Date(a.date).getTime() : a.source.localeCompare(b.source)));

    const summarizedContent = searchResults.map((item) => `- ${item.title}: ${item.snippet}`).join("\n");

    console.time("OpenAI Summary");
    const systemMessage = `Based on '" + message + "' and the search results, start with a short opening sentence that dives into the topic. Then list two or three key points from the results that answer what they're asking, keeping it natural and to the point. Use bullet points, one per line, and end with a brief closing sentence. Mix up the wording each time to avoid sounding the same.`;
    const streamCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: summarizedContent },
      ],
    });

    let summary = "";
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamCompletion) {
            const token = chunk.choices[0]?.delta?.content;
            if (token) {
              summary += token;
              controller.enqueue(encoder.encode(JSON.stringify({ token }) + "\n"));
            }
          }
          console.timeEnd("OpenAI Summary");

          console.time("Image Fetching");
          searchResults = await Promise.all(
            searchResults.map(async (item) => {
              if (!item.image || item.image.includes("lookaside.instagram.com") || item.image.includes("lookaside.fbsbx.com")) {
                item.image = (await fetchImageFromPage(item.link)) || `https://www.google.com/s2/favicons?sz=256&domain=${new URL(item.link).hostname}`;
              }
              return item;
            })
          );
          console.timeEnd("Image Fetching");

          console.time("OpenAI Suggestions");
          const suggestionsResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Generate follow-up search suggestions based on the query and results. No specific years. Format each suggestion on a new line starting with '- '." },
              { role: "user", content: `Query: "${message}". Results:\n\n${summarizedContent}\n\nSuggest relevant follow-ups.` },
            ],
          });
          const suggestions = suggestionsResponse.choices[0]?.message?.content?.split("\n")
            .map(s => s.trim().replace(/^-?\s*/, ''))
            .filter(s => s) || [];
          console.timeEnd("OpenAI Suggestions");

          const newSearchEntry = {
            query: message,
            summary: summary.trim(),
            results: searchResults,
            suggestions,
          };

          let sessionId: number | undefined;
          if (isLoggedIn) {
            console.time("DB Update");
            const latestSession = await db(
              'SELECT id, searches FROM search_sessions WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
              [userId]
            );

            if (!latestSession.length || latestSession[0].searches.length >= 10) {
              const result = await db(
                'INSERT INTO search_sessions (user_id, searches) VALUES ($1, $2) RETURNING id',
                [userId, JSON.stringify([newSearchEntry])]
              );
              sessionId = result[0].id;
            } else {
              const currentSearches = latestSession[0].searches;
              currentSearches.push(newSearchEntry);
              await db(
                'UPDATE search_sessions SET searches = $1, updated_at = NOW() WHERE id = $2',
                [JSON.stringify(currentSearches), latestSession[0].id]
              );
              sessionId = latestSession[0].id;
            }
            console.timeEnd("DB Update");
          }

          controller.enqueue(encoder.encode(JSON.stringify({ final: true, searchResults, suggestions, sessionId }) + "\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(stream, { headers: { "Content-Type": "text/plain" } });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process search" }, { status: 500 });
  }
}