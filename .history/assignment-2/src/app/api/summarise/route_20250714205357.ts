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

    const trimmedText = blogText.slice(0, 10000); // Gemini prompt limit safety

    // 2. Use Gemini API to summarize
    const summarizationRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [
              {
                text: `Summarize the following blog content in 3-4 lines:\n\n${trimmedText}`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: process.env.GEMINI_API_KEY!,
        }
      }
    );

    const englishSummary =
      summarizationRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Summarization failed.';

    // 3. Use Gemini again to translate summary to Urdu
    const translationRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [
              {
                text: `Translate this text into Urdu:\n\n${englishSummary}`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: process.env.GEMINI_API_KEY!,
        }
      }
    );

    const urduSummary =
      translationRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Translation failed.';

    return NextResponse.json({ englishSummary, urduSummary });
  } catch (error: any) {
    console.error('Gemini API error:', error?.response?.data || error.message);
    return NextResponse.json({ error: 'Gemini processing failed.' }, { status: 500 });
  }
}
