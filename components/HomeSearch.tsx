'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';

export default function HomeSearch() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('lost');
  const [category, setCategory] = useState('all');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category && category !== 'all') params.set('category', category);
    
    if (type === 'found') {
      router.push(`/found?${params.toString()}`);
    } else {
      router.push(`/lost?${params.toString()}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-4xl mx-auto glass p-4 sm:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-3 items-center border border-border bg-card/65 dark:bg-card/30"
    >
      <div className="relative w-full md:flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by wallet, keys, watch, phone..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-10 h-12 w-full bg-background/50 border-border"
        />
      </div>

      <div className="w-full md:w-48">
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-12 bg-background/50 border-border"
        >
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="wallet">Wallet</option>
          <option value="keys">Keys</option>
          <option value="id card">ID Card</option>
          <option value="books">Books</option>
          <option value="accessories">Accessories</option>
        </Select>
      </div>

      <div className="w-full md:w-48">
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-12 bg-background/50 border-border"
        >
          <option value="lost">Lost Items</option>
          <option value="found">Found Items</option>
        </Select>
      </div>

      <Button type="submit" size="lg" className="w-full md:w-auto h-12 px-8 flex items-center justify-center gap-2">
        <Search className="h-4 w-4" />
        <span>Search</span>
      </Button>
    </form>
  );
}
