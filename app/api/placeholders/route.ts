import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an assistant generating realistic, concise search placeholder suggestions that mimic how people query a search engine. Focus on practical, user-friendly phrases and questions. Include some inspired by trending topics of 2025 (e.g., AI innovations, space exploration, sustainability, tech releases, entertainment). Capitalize the first word of about half the suggestions for variety, leaving the rest lowercase. Keep it varied and engaging, but avoid overly quirky or unrealistic ideas. Return a plain list separated by newlines, no numbering or extra text.",
        },
        {
          role: "user",
          content: "Generate 20 unique search placeholder suggestions.",
        },
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const text = completion.choices[0].message.content || "";
    const placeholders = text.split("\n").filter(Boolean);

    return NextResponse.json({ placeholders });
  } catch (error) {
    console.error("Error generating placeholders:", error);
    return NextResponse.json({
      placeholders: ["Search something interesting..."],
    }, { status: 500 });
  }
}