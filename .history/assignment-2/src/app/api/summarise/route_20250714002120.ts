import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  try {
    // 1. Scrape blog text
    const htmlRes = await axios.get(url);
    const $ = cheerio.load(htmlRes.data);
    const blogText = $('p').map((_, el) => $(el).text()).get().join(' ');

    if (!blogText || blogText.length < 100) {
      return NextResponse.json({ summary: 'Not enough content to summarize.' });
    }

    // 2. Call RapidAPI summarizer
    const rapidRes = await axios.post(
      'https://article-extractor-and-summarizer.p.rapidapi.com/summarize-text',
      {
        lang: 'en',
        text: blogText.slice(0, 8000), // Trim if too long
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'article-extractor-and-summarizer.p.rapidapi.com',
          'x-rapidapi-key': process.env.RAPIDAPI_KEY!, // Secure
        },
      }
    );

    const summary = rapidRes.data?.summary || 'Summarization failed.';
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Error:', error.message);
    return NextResponse.json({ summary: 'Error occurred during summarization.' }, { status: 500 });
  }
}
