import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const db = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const sessions = await db(
      'SELECT id, user_id, created_at, updated_at, searches FROM search_sessions ORDER BY updated_at DESC'
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