import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const db = neon(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
  try {
    const userId = req.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ sessions: [] }, { status: 200 });
    }

    const sessions = await db(
      'SELECT id, user_id, created_at, updated_at, searches FROM search_sessions WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    const formattedSessions = (sessions as any[]).map((session) => ({
      ...session,
      searches: session.searches.map((search: any) => ({
        ...search,
        results: search.results.map((result: any) => ({
          ...result,
          image: result.image || "",
        })),
      })),
    }));
    return NextResponse.json({ sessions: formattedSessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}