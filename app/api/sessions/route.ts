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
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.cookies.get("userId")?.value;
    const { sessionId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const result = await db(
      'DELETE FROM search_sessions WHERE id = $1 AND user_id = $2 RETURNING id',
      [sessionId, userId]
    );

    if (result.length === 0) {
      return NextResponse.json({ error: "Session not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Session deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}