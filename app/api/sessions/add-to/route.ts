import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const db = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const { sessionId, query, summary, results, suggestions } = await req.json();
    const userId = req.cookies.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ success: false, error: "User not authenticated" }, { status: 401 });
    }

    const newSearchEntry = {
      query,
      summary,
      results,
      suggestions,
      timestamp: new Date().toISOString(),
    };

    let finalSessionId = sessionId;

    if (!sessionId) {
      const result = await db(
        "INSERT INTO search_sessions (user_id, searches, updated_at) VALUES ($1, $2, NOW()) RETURNING id",
        [userId, JSON.stringify([newSearchEntry])]
      );
      finalSessionId = result[0].id;
      return NextResponse.json({ success: true, sessionId: finalSessionId, isNewSession: true, updatedSearches: [newSearchEntry] });
    }

    const sessionResult = await db(
      "SELECT searches FROM search_sessions WHERE id = $1 AND user_id = $2",
      [sessionId, userId]
    );

    if (!sessionResult.length) {
      return NextResponse.json({ success: false, error: "Session not found or unauthorized" }, { status: 404 });
    }

    const currentSearches = sessionResult[0].searches || [];
    if (currentSearches.length >= 10) {
      return NextResponse.json({ success: false, limitReached: true, message: "Session limit reached (10 searches max)" });
    }

    if (currentSearches.some((s: any) => s.query === query && s.summary === summary)) {
      return NextResponse.json({ success: true, sessionId, updatedSearches: currentSearches });
    }

    const updatedSearches = [...currentSearches, newSearchEntry];
    await db(
      "UPDATE search_sessions SET searches = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3",
      [JSON.stringify(updatedSearches), sessionId, userId]
    );

    return NextResponse.json({ success: true, sessionId, updatedSearches });
  } catch (error) {
    console.error("Add-to-session error:", error);
    return NextResponse.json({ success: false, error: "Failed to add to session" }, { status: 500 });
  }
}