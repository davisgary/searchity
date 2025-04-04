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
    const { message, sessionId } = await req.json();
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
    const systemMessage = `Based on the query "${message}", start with a concise answer if the query asks for a specific fact (e.g., a date, location, or definition), using the search results to confirm or refine it. If the query is broad or results lack a clear answer, provide a brief overview instead. Then list 2-3 key points from the results that directly address the query, using bullet points, one per line. Keep it clear, natural, and focused on the user’s intent. End with a short sentence tying back to their question.`;
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

          let finalSessionId: number | undefined;
          if (isLoggedIn) {
            console.time("DB Update");
            if (sessionId) {
              const sessionResult = await db(
                'SELECT searches FROM search_sessions WHERE id = $1 AND user_id = $2',
                [sessionId, userId]
              );
              if (sessionResult.length && sessionResult[0].searches.length < 10) {
                const currentSearches = sessionResult[0].searches;
                currentSearches.push(newSearchEntry);
                await db(
                  'UPDATE search_sessions SET searches = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
                  [JSON.stringify(currentSearches), sessionId, userId]
                );
                finalSessionId = parseInt(sessionId);
                console.log("Appended to session:", finalSessionId, "searches:", currentSearches);
              } else {
                const result = await db(
                  'INSERT INTO search_sessions (user_id, searches, updated_at) VALUES ($1, $2, NOW()) RETURNING id',
                  [userId, JSON.stringify([newSearchEntry])]
                );
                finalSessionId = result[0].id;
                console.log("New session created due to limit or invalid session ID:", finalSessionId);
              }
            } else {
              const result = await db(
                'INSERT INTO search_sessions (user_id, searches, updated_at) VALUES ($1, $2, NOW()) RETURNING id',
                [userId, JSON.stringify([newSearchEntry])]
              );
              finalSessionId = result[0].id;
              console.log("New session created with ID:", finalSessionId);
            }
            console.timeEnd("DB Update");
          }

          controller.enqueue(encoder.encode(JSON.stringify({ final: true, searchResults, suggestions, sessionId: finalSessionId }) + "\n"));
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