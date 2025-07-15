import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  try {
    // Step 1: Scrape blog content
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const text = $('p')
      .map((_, el) => $(el).text())
      .get()
      .join(' ');

    if (!text || text.length < 100) {
      return NextResponse.json({ summary: 'Not enough text found to summarise.' });
    }

    // Step 2: Call MeaningCloud summarization API
    const summaryRes = await axios.post(
      'https://api.meaningcloud.com/summarization-1.0',
      new URLSearchParams({
        key: process.env.MEANINGCLOUD_API_KEY!,
        txt: text,
        sentences: '3',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const summary = summaryRes.data?.summary || 'Summarization failed.';

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json({ summary: 'Error during processing.' }, { status: 500 });
  }
}
