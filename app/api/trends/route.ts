import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import { Buffer } from 'buffer';

const bigquery = new BigQuery({
  credentials: JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS!, 'base64').toString('utf-8')),
});

export async function GET() {
  try {
    const query = `
      SELECT
        term,
        ARRAY_AGG(STRUCT(rank, week) ORDER BY week DESC LIMIT 1) x
      FROM
        \`bigquery-public-data.google_trends.top_terms\`
      WHERE
        refresh_date = 
          (SELECT MAX(refresh_date) FROM \`bigquery-public-data.google_trends.top_terms\`)
      GROUP BY
        term
      ORDER BY
        (SELECT rank FROM UNNEST(x))
    `;

    const [rows] = await bigquery.query(query);

    const trends = rows.map((row: any) => ({
      term: row.term,
    }));

    return NextResponse.json({ trends });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Google Trends' }, { status: 500 });
  }
}