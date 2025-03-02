import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const db = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const { sessionId: providedSessionId, query, summary = "", results = [], suggestions = [] } = await req.json();
    const userId = req.cookies.get("userId")?.value;

    if (!query || !userId) {
      return NextResponse.json({ error: "Missing query or userId" }, { status: 400 });
    }

    let sessionId = providedSessionId;
    let isNewSession = false;

    if (sessionId) {
      const sessionCheck = await db(
        'SELECT searches FROM search_sessions WHERE id = $1 AND user_id = $2',
        [sessionId, userId]
      );
      if (!sessionCheck.length) {
        sessionId = null;
      }
    }

    if (!sessionId) {
      const sessionResult = await db(
        'INSERT INTO search_sessions (user_id, searches) VALUES ($1, $2) RETURNING id',
        [userId, '[]']
      );
      sessionId = sessionResult[0].id.toString();
      isNewSession = true;
      console.log('New session created for userId:', userId, 'sessionId:', sessionId);
    }

    const sessionResult = await db(
      'SELECT searches FROM search_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );
    const currentSearches = sessionResult[0]?.searches || [];

    const MAX_SEARCHES = 15;
    console.log("Current searches count:", currentSearches.length, "Max:", MAX_SEARCHES);
    if (currentSearches.length >= MAX_SEARCHES) {
      console.log("Limit reached for session:", sessionId);
      return NextResponse.json({
        success: false,
        limitReached: true,
        message: "This session is full (15 searches max). Start a new one or upgrade for more!",
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
      'UPDATE search_sessions SET searches = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
      [JSON.stringify(currentSearches), sessionId, userId]
    );

    return NextResponse.json({ success: true, updatedSearches: currentSearches, sessionId, isNewSession });
  } catch (error) {
    console.error("Error adding to session:", error);
    return NextResponse.json({ error: "Failed to add to session" }, { status: 500 });
  }
}