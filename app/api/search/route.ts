import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { neon } from "@neondatabase/serverless";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const db = neon(process.env.DATABASE_URL!);

async function fetchWithTimeout(url: string, options = {}, timeout = 1000) {
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

    const res = await fetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-99" },
      signal: controller.signal,
    });

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
  console.log("Search route hit");
  try {
    const { message } = await req.json();
    if (!message) throw new Error("Missing message in request.");
    console.log("Message received:", message);

    const userId = req.cookies.get("userId")?.value;
    if (!userId) throw new Error("User not authenticated");
    console.log("User ID:", userId);

    const { GOOGLE_API_KEY, CUSTOM_SEARCH_ENGINE_ID } = process.env;
    if (!GOOGLE_API_KEY || !CUSTOM_SEARCH_ENGINE_ID) throw new Error("Missing API keys");

    console.log("Fetching search results...");
    const searchEngines = [
      {
        url: `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${CUSTOM_SEARCH_ENGINE_ID}&q=${encodeURIComponent(message)}&sort=date&fields=items(title,link,snippet,pagemap(cse_image),pagemap(metatags))&num=5`,
        headers: {},
      },
    ];

    const responses = await Promise.all(searchEngines.map(({ url, headers }) => fetchWithTimeout(url, { headers })));
    if (responses.some(res => !res?.ok)) throw new Error("Failed to fetch search results");
    console.log("Search results fetched");

    const validResponses = responses.filter((res): res is Response => res !== null);
    const [googleData] = await Promise.all(validResponses.map(res => res.json()));

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

    searchResults.sort((a, b) => (a.date && b.date ? new Date(b.date).getTime() - new Date(a.date).getTime() : a.source.localeCompare(b.source)));

    if (!searchResults.length) {
      return NextResponse.json({ message: "Hmm, we couldn’t find anything with that.", searchResults: [], suggestions: [] });
    }

    const currentDate = new Date();
    searchResults = searchResults.map((item) => {
      const eventDateString = item.date || null;
      const isPastEvent = eventDateString && new Date(eventDateString) < currentDate;
      const isOngoingEvent = eventDateString && item.date.includes("–") && isEventOngoing(item.date);
      if (isPastEvent) item.snippet = `${item.snippet} (Event has already occurred)`;
      else if (isOngoingEvent) item.snippet = `${item.snippet} (Currently happening)`;
      return item;
    });

    const summarizedContent = searchResults.map((item) => `- ${item.title}: ${item.snippet}`).join("\n");

    const systemMessage = searchResults.some((item) => item.snippet.includes("(Currently happening)"))
      ? "Summarize the following search results, highlighting the ongoing event if applicable."
      : "Summarize the following search results in a concise response that directly addresses the user's query: '${message}'. Use this format: - A brief introductory sentence summarizing the key findings. - Two to three bullet points highlighting the most relevant details (use '-' for bullets, no numbers). - A short closing remark tying back to the query. If any result mentions an ongoing event, emphasize it in one of the bullet points.";

    console.log("Starting OpenAI stream...");
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
            if (token && token.trim()) {
              summary += token;
              controller.enqueue(encoder.encode(JSON.stringify({ token }) + "\n"));
            }
          }

          console.log("Fetching images...");
          searchResults = await Promise.all(
            searchResults.map(async (item) => {
              if (!item.image || item.image.includes("lookaside.instagram.com") || item.image.includes("lookaside.fbsbx.com")) {
                item.image = (await fetchImageFromPage(item.link)) || `https://www.google.com/s2/favicons?sz=256&domain=${new URL(item.link).hostname}`;
              }
              return item;
            })
          );

          console.log("Generating suggestions...");
          const suggestionsResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Generate follow-up search suggestions based on the query and results. No specific years." },
              { role: "user", content: `Query: "${message}". Results:\n\n${summarizedContent}\n\nSuggest relevant follow-ups.` },
            ],
          });
          const suggestions = suggestionsResponse.choices[0]?.message?.content?.split("\n").map(s => s.trim().replace(/^\d+\.\s*/, "")) || [];

          const newSearchEntry = {
            query: message,
            timestamp: new Date().toISOString(),
            summary: summary.trim(),
            results: searchResults,
            suggestions,
          };

          console.log("Checking session in Neon...");
          const latestSession = await db(
            'SELECT id, searches FROM search_sessions WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
            [userId]
          );

          let sessionId: number;
          if (!latestSession.length || latestSession[0].searches.length >= 10) {
            console.log("Creating new session...");
            const result = await db(
              'INSERT INTO search_sessions (user_id, searches) VALUES ($1, $2) RETURNING id',
              [userId, JSON.stringify([newSearchEntry])]
            );
            sessionId = result[0].id;
          } else {
            console.log("Updating existing session...");
            const currentSearches = latestSession[0].searches;
            currentSearches.push(newSearchEntry);
            await db(
              'UPDATE search_sessions SET searches = $1, updated_at = NOW() WHERE id = $2',
              [JSON.stringify(currentSearches), latestSession[0].id]
            );
            sessionId = latestSession[0].id;
          }

          console.log("Streaming final response with sessionId:", sessionId);
          controller.enqueue(encoder.encode(JSON.stringify({ final: true, searchResults, suggestions, sessionId }) + "\n"));
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new NextResponse(stream, { headers: { "Content-Type": "text/plain" } });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Failed to process search" }, { status: 500 });
  }
}

const isEventOngoing = (eventDate: string): boolean => {
  const currentDate = new Date();
  const [startDate, endDate] = eventDate.split("–");
  const start = new Date(startDate.trim());
  const end = new Date(endDate.trim());
  return currentDate >= start && currentDate <= end;
};