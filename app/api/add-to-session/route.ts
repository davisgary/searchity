import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const db = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const { sessionId, query, summary = "", results = [], suggestions = [] } = await req.json();
    if (!sessionId || !query) {
      return NextResponse.json({ error: "Missing sessionId or query" }, { status: 400 });
    }

    const sessionResult = await db(
      'SELECT searches FROM search_sessions WHERE id = $1',
      [sessionId]
    );
    if (!sessionResult.length) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const currentSearches = sessionResult[0].searches;
    const MAX_SEARCHES = 12;

    console.log("Current searches count:", currentSearches.length, "Max:", MAX_SEARCHES);
    if (currentSearches.length >= MAX_SEARCHES) {
      console.log("Limit reached for session:", sessionId);
      return NextResponse.json({
        success: false,
        limitReached: true,
        message: "You've reached your limit on this thread. Start a new one or upgrade for more!",
      }, { status: 200 });
    }

    const newSearch = {
      query,
      summary,
      results: results.map((r: any) => ({ ...r, image: r.image || "" })),
      suggestions,
    };
    currentSearches.push(newSearch);

    console.log("Updating session with new search:", newSearch);
    await db(
      'UPDATE search_sessions SET searches = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(currentSearches), sessionId]
    );

    return NextResponse.json({ success: true, updatedSearches: currentSearches });
  } catch (error) {
    console.error("Error adding to session:", error);
    return NextResponse.json({ error: "Failed to add to session" }, { status: 500 });
  }
}