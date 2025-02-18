import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { message } = await request.json();

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that conducts real-time web searches to provide recent news, stories, and information from trusted sources. Your responses should be structured, concise, and fact-based, summarizing key details in a clear and neutral manner. Always perform web searches to gather the most recent and authoritative information, ensuring accuracy and credibility. Aggregate findings into a well-organized response, prioritizing clarity while maintaining factual integrity.',
        },
        {
          role: 'user',
          content: `Provide a summary of the most recent news and information about ${message}.`,
        },
      ],
      temperature: 0.2,
      top_k: 0,
      top_p: 0.9,
      frequency_penalty: 1,
      presence_penalty: 0,
      search_recency_filter: 'month',
    }),
  };

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', options);
    const data = await response.json();
    console.log('Perplexity API Response:', data);

    if (data && data.choices && data.choices.length > 0) {
      return NextResponse.json({
        message: data.choices[0].message.content,
      });
    } else {
      console.error('Unexpected data structure:', data);
      return NextResponse.json({ error: 'Unexpected response structure' }, { status: 500 });
    }
  } catch (err) {
    console.error('Error fetching from Perplexity API:', err);
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
}