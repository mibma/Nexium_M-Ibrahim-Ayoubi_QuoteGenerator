'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [url, setUrl] = useState('');
  const [englishSummary, setEnglishSummary] = useState('');
  const [urduSummary, setUrduSummary] = useState('');
  const [fullText, setFullText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch('/api/summarise', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    setEnglishSummary(data.englishSummary || 'Failed to summarize');
    setUrduSummary(data.urduSummary || 'Failed to translate');
    setFullText(data.fullText || 'Failed to scrape content');
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="grid grid-cols-2 grid-rows-2 gap-6">

        {/* Top Left: Input Box */}
        <div className="border p-4 rounded bg-white shadow">
          <h2 className="font-semibold mb-2">Blog URL</h2>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste blog URL"
          />
          <Button onClick={handleSubmit} disabled={loading} className="mt-4 w-full">
            {loading ? 'Processing...' : 'Summarise & Translate'}
          </Button>
        </div>

        {/* Top Right: English Summary */}
        <div className="border p-4 rounded bg-gray-100 shadow overflow-auto">
          <h2 className="font-semibold mb-2">English Summary</h2>
          <p className="text-sm whitespace-pre-wrap">{englishSummary}</p>
        </div>

        {/* Bottom Left: Urdu Summary */}
        <div className="border p-4 rounded bg-gray-100 shadow overflow-auto">
          <h2 className="font-semibold mb-2">Urdu Translation</h2>
          <p className="text-sm whitespace-pre-wrap">{urduSummary}</p>
        </div>

        {/* Bottom Right: Full Scraped Blog Text */}
        <div className="border p-4 rounded bg-gray-50 shadow overflow-auto">
          <h2 className="font-semibold mb-2">Full Blog Text</h2>
          <p className="text-sm whitespace-pre-wrap">{fullText}</p>
        </div>

      </div>
    </div>
  );
}
