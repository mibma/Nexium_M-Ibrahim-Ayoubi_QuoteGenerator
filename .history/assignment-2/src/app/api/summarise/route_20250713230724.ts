import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  console.log('Received URL:', url);

  try {
    const htmlRes = await axios.get(url);
    const $ = cheerio.load(htmlRes.data);
    const blogText = $('p').map((_, el) => $(el).text()).get().join(' ');

    console.log('Extracted text length:', blogText.length);

    if (!blogText || blogText.length < 100) {
      return NextResponse.json({ summary: 'Not enough content to summarize.' });
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a blog summarizer.' },
          { role: 'user', content: `Summarize this blog in 3-4 lines:\n\n${blogText.slice(0, 12000)}` },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const result = await openaiRes.json();
    console.log('OpenAI Response:', JSON.stringify(result, null, 2));

    const summary = result?.choices?.[0]?.message?.content ?? 'Summarization failed.';
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('ERROR:', error.message);
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 });
  }
}
