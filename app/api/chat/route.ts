import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const conversationHistory: { role: string; content: string }[] = [];

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    conversationHistory.push({ role: 'user', content: message });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a smart and thoughtful assistant. Always provide insightful and well-reasoned responses, going the extra mile to analyze the situation and offer valuable perspectives. Use observational humor and witty remarks when appropriate, but focus on offering intelligent, in-depth answers. Keep the tone lighthearted and approachable, with minimal sarcasm, and avoid self-deprecating humor.',
        },
        ...conversationHistory.map((msg) => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        })),
      ],
    });

    const assistantMessage = response.choices[0]?.message?.content ?? '';

    conversationHistory.push({ role: 'assistant', content: assistantMessage });

    return NextResponse.json({
      message: assistantMessage,
    });
  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}