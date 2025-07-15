import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import clientPromise from '@/lib/mongo';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const htmlRes = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const $ = cheerio.load(htmlRes.data);
    const blogText = $('p').map((_, el) => $(el).text()).get().join(' ');

    if (!blogText || blogText.length < 100) {
      return NextResponse.json({ summary: 'Not enough content to summarize.' });
    }

    // Check MongoDB if already exists
    const client = await clientPromise;
    const db = client.db('blogdata');
    const collection = db.collection('blogs');
    const existing = await collection.findOne({ url });

    if (existing) {
      return NextResponse.json({
        summary: existing.englishSummary,
        urduSummary: existing.urduSummary,
        fullText: existing.fullText,
      });
    }

    // Call Gemini summarization
    const summaryRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Summarize this:\n${blogText}` }] }],
        }),
      }
    );

    const summaryJson = await summaryRes.json();
    const englishSummary =
      summaryJson.candidates?.[0]?.content?.parts?.[0]?.text || 'Summarization failed.';

    // Call Gemini translation
    const urduRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Translate this to Urdu:\n${englishSummary}` }] }],
        }),
      }
    );

    const urduJson = await urduRes.json();
    const urduSummary =
      urduJson.candidates?.[0]?.content?.parts?.[0]?.text || 'ترجمہ ناکام۔';

    // Save to MongoDB
    await collection.insertOne({
      url,
      englishSummary,
      urduSummary,
      fullText: blogText,
      createdAt: new Date(),
    });

    return NextResponse.json({
      summary: englishSummary,
      urduSummary,
      fullText: blogText,
    });

  } catch (err: unknown) {
    console.error('Error in /api/summarise:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
