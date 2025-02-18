import { NextResponse } from 'next/server';

const googleTrends: any = require('google-trends-api');

export async function GET() {
  try {
    console.log('Fetching Google Trends data...');

    const trendsData = await googleTrends.dailyTrends({
      geo: 'US',
    });

    console.log('Google Trends data fetched:', trendsData);

    const parsedData = JSON.parse(trendsData);
    const trends = parsedData.default.trendingSearchesDays.flatMap(
      (day: any) => day.trendingSearches.map((search: any) => search.title.query)
    );

    console.log('Parsed trends:', trends);

    return NextResponse.json({ trends });
  } catch (error) {
    console.error('Error fetching Google Trends:', error);
    return NextResponse.json({ error: 'Failed to fetch Google Trends' }, { status: 500 });
  }
}