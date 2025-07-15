import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import clientPromise from '../../../lib/mongo'; // MongoDB connection helper

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('blogdata');
    const collection = db.collection('blogs');

    // Check if blog already exists
    const existing = await collection.findOne({ url });
    if (existing) {
      return NextResponse.json({
        englishSummary: existing.englishSummary,
        urduSummary: existing.urduSummary,
        fullText: existing.fullText,
      });
    }

    // Scrape blog text
    const htmlRes = await axios.get(url);
    const $ = cheerio.load(htmlRes.data);
    const blogText = $('p').map((_, el) => $(el).text()).get().join(' ');

    if (!blogText || blogText.length < 100) {
      return NextResponse.json({ summary: 'Not enough content to summarize.' });
    }

    const trimmedText = blogText.slice(0, 10000); // Gemini token limit safety

    // Call Gemini for English Summary
    const summarizeRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [
              { text: `Summarize the following blog content in 3-4 lines:\n\n${trimmedText}` }
            ]
          }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        params: { key: process.env.GEMINI_API_KEY! }
      }
    );

    const englishSummary =
      summarizeRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Summarization failed.';

    // Call Gemini for Urdu Translation
    const translateRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [
              { text: `Translate this into Urdu:\n\n${englishSummary}` }
            ]
          }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        params: { key: process.env.GEMINI_API_KEY! }
      }
    );

    const urduSummary =
      translateRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Translation failed.';

    // Save to MongoDB
    await collection.insertOne({
      url,
      englishSummary,
      urduSummary,
      fullText: blogText,
      createdAt: new Date(),
    });

    // Return response
    return NextResponse.json({ englishSummary, urduSummary, fullText: blogText });

  } catch (error: any) {
    console.error('Error in route.ts:', error?.message || error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
