'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch('/api/summarise', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    setSummary(data.summary || 'Failed to summarise');
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-4">
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste blog URL"
      />
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Summarising...' : 'Summarise Blog'}
      </Button>

      {summary && (
        <div className="mt-6 border p-4 rounded bg-gray-100">
          <h2 className="font-semibold mb-2">Summary:</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
