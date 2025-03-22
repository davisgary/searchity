import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const db = neon(process.env.DATABASE_URL!);

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.cookies.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db(
      'DELETE FROM search_sessions WHERE user_id = $1 RETURNING id',
      [userId]
    );

    if (result.length === 0) {
      return NextResponse.json({ message: "No sessions found to delete" }, { status: 200 });
    }

    return NextResponse.json({ message: "All sessions deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete all sessions" }, { status: 500 });
  }
}