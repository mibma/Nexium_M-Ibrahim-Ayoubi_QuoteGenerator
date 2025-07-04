'use client';
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { quotes } from "@/data/quotes";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState<string[]>([]);

  const handleSubmit = () => {
    const matched = quotes
      .filter(q => q.topic.toLowerCase() === topic.toLowerCase())
      .map(q => q.text)
      .slice(0, 3);
    setResults(matched.length ? matched : ["No quotes found for this topic."]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold text-center">Quote Generator</h1>
        <Input
          placeholder="Tell your problem in one word and we'll motivate you (e.g. success)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <Button alig onClick={handleSubmit}>Inspire Me</Button>
        <div className="mt-4 space-y-2">
          {results.map((quote, idx) => (
            <div key={idx} className="p-4 bg-base-200 rounded shadow">
              {quote}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
