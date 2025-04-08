import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

const xml2js = require('xml2js') as any;

export async function GET() {
  try {
    const response = await fetch('https://trends.google.com/trending/rss?geo=US');
    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.statusText}`);
    }

    const xml = await response.text();

    const result = await xml2js.parseStringPromise(xml);
    const items = result.rss.channel[0].item;

    const trends = items.map((item: any) => ({
      term: item.title[0],
    }));

    console.log('Fetched Trends from RSS:', trends);

    return NextResponse.json({ trends }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as { message: unknown }).message);
    }

    console.error('RSS Fetch Error:', errorMessage);
    return NextResponse.json({ error: 'Failed to fetch Google Trends: ' + errorMessage }, { status: 500 });
  }
}