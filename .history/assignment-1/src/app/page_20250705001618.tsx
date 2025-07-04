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
        <h1 className="text-5xl font-extrabold text-center mb-6">Quote Generator</h1>
        <Input
          className="h-16 text-lg px-6 py-4"
          placeholder="Tell your problem in one word and we'll motivate you (e.g. success)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <div className="flex justify-center items-center my-6">
          <Button className="w-2/3 h-14 text-xl" onClick={handleSubmit}>Inspire Me</Button>
        </div>
        <div className="mt-4 space-y-6">
          {results.map((quote, idx) => (
            <div key={idx} className="relative bg-white text-gray-900 rounded-xl shadow-lg px-8 py-8 flex flex-col items-center min-h-[120px]">
              <span className="absolute left-4 top-2 text-5xl text-gray-300 select-none leading-none">“</span>
              <span className="w-full text-center text-lg font-medium z-10">{quote}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
