import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  try {
    const { message } = await req.json();
    if (!message) throw new Error("Missing message in request.");

    const { GOOGLE_API_KEY, CUSTOM_SEARCH_ENGINE_ID, BING_API_KEY } = process.env;
    if (!GOOGLE_API_KEY || !CUSTOM_SEARCH_ENGINE_ID || !BING_API_KEY) throw new Error("Missing one or more API keys.");

    const searchEngines = [
      {
        url: `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${CUSTOM_SEARCH_ENGINE_ID}&q=${encodeURIComponent(message)}&sort=date&fields=items(title,link,snippet,pagemap(cse_image),pagemap(metatags))&num=5`,
        headers: {},
      },
      {
        url: `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(message)}&$select=name,url,snippet,image,webPages&count=3`,
        headers: { "Ocp-Apim-Subscription-Key": BING_API_KEY },
      },
    ];

    const responses = await Promise.all(searchEngines.map(({ url, headers }) => fetchWithTimeout(url, { headers })));
    if (responses.some(res => !res?.ok)) throw new Error("Failed to fetch search results.");

    const validResponses = responses.filter((res): res is Response => res !== null);
    const [googleData, bingData] = await Promise.all(validResponses.map(res => res.json()));
    
    let searchResults = [
      ...(googleData.items || []).map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link,
        image: item.pagemap?.cse_image?.[0]?.src || null,
        source: "Google",
        date: item.pagemap?.metatags?.[0]?.["article:published_time"] || null,
      })),
      ...(bingData.webPages?.value || []).map((item: any) => ({
        title: item.name,
        snippet: item.snippet,
        link: item.url,
        image: item.image?.thumbnail?.contentUrl || null,
        source: "Bing",
        date: item.dateLastCrawled || null,
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
      return NextResponse.json({ message: "Hmm, we couldn’t find anything with that. Try a different search.", searchResults: [], suggestions: [] });
    }

    const currentDate = new Date();
    searchResults = searchResults.map((item) => {
      const eventDateString = item.date || null;
      const isPastEvent = eventDateString && new Date(eventDateString) < currentDate;
      const isOngoingEvent = eventDateString && item.date.includes("–") && isEventOngoing(item.date);

      if (isPastEvent) {
        item.snippet = `${item.snippet} (Event has already occurred)`;
      } else if (isOngoingEvent) {
        item.snippet = `${item.snippet} (Currently happening)`;
      }
      return item;
    });

    const summarizedContent = searchResults.map((item) => `- ${item.title}: ${item.snippet}`).join("\n");

    const systemMessage = searchResults.some((item) => item.snippet.includes("(Currently happening)"))
      ? "Summarize the following search results for the user, highlighting the ongoing event if applicable."
      : "Summarize the following search results for the user. If recent news is available, highlight it. Otherwise, provide a general summary of the most relevant information. Start with an introductory sentence or two, then present two to three bullet points covering key details, and conclude with a final remark.";

    const streamCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: summarizedContent },
      ],
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamCompletion) {
            const token = chunk.choices[0]?.delta?.content;
            if (token && token.trim()) controller.enqueue(encoder.encode(JSON.stringify({ token }) + "\n"));
          }

          searchResults = await Promise.all(
            searchResults.map(async (item) => {
              if (!item.image || item.image.includes("lookaside.instagram.com") || item.image.includes("lookaside.fbsbx.com")) {
                item.image = (await fetchImageFromPage(item.link)) || `https://www.google.com/s2/favicons?sz=256&domain=${new URL(item.link).hostname}`;
              }
              return item;
            })
          );

          const suggestionsResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Generate follow-up search suggestions based on the user's query and the provided search results. Suggestions must be relevant to the topics found in the search results and should focus on recent, widely discussed events. Do NOT include any specific years (e.g., 2023, 2024) in the suggestions. If a topic is time-sensitive, phrase it in a general way without mentioning years." }, 
              { role: "user", content: `User's query: "${message}". Based on these search results:\n\n${summarizedContent}\n\nPlease suggest follow-up search queries that are directly relevant to these results. Do NOT include specific years in your suggestions.` } 
            ],
          });

          const suggestions = suggestionsResponse.choices[0]?.message?.content?.split("\n").map(s => s.trim().replace(/^\d+\.\s*/, "")) || [];

          controller.enqueue(encoder.encode(JSON.stringify({ final: true, searchResults, suggestions }) + "\n"));
        } catch (err) {
          console.error("Streaming error:", err);
          controller.error(err);
        }
        controller.close();
      },
    });

    return new NextResponse(stream, { headers: { "Content-Type": "text/plain" } });
  } catch (error) {
    console.error("Error in search and summarize API route:", error);
    return NextResponse.json({ error: "Failed to fetch or process search results" }, { status: 500 });
  }
}

const isEventOngoing = (eventDate: string): boolean => {
  const currentDate = new Date();
  const [startDate, endDate] = eventDate.split("–");
  const start = new Date(startDate.trim());
  const end = new Date(endDate.trim());
  return currentDate >= start && currentDate <= end;
};