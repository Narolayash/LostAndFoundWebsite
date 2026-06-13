'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Select } from './ui/select';

export default function ItemsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state initialized from URL search params
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');

  // Debounce search query update in URL
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      
      if (q) {
        current.set('q', q);
      } else {
        current.delete('q');
      }

      const queryStr = current.toString();
      const query = queryStr ? `?${queryStr}` : '';
      router.push(`${pathname}${query}`);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [q, pathname, router, searchParams]);

  // Handle dropdown select updates immediately
  const handleDropdownChange = (name: 'category' | 'sort', value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (value && value !== 'all') {
      current.set(name, value);
    } else {
      current.delete(name);
    }

    if (name === 'sort' && value === 'latest') {
      current.delete('sort'); // Default
    }

    const queryStr = current.toString();
    const query = queryStr ? `?${queryStr}` : '';
    router.push(`${pathname}${query}`);

    if (name === 'category') setCategory(value);
    if (name === 'sort') setSort(value);
  };

  // Sync state with URL modifications (e.g. going back/forward)
  useEffect(() => {
    setQ(searchParams.get('q') || '');
    setCategory(searchParams.get('category') || 'all');
    setSort(searchParams.get('sort') || 'latest');
  }, [searchParams]);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full p-4 border border-border bg-card/50 dark:bg-card/20 rounded-xl mb-8">
      {/* Search Input */}
      <div className="relative w-full md:flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search items..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 w-full bg-background"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="flex-1 md:flex-none min-w-[140px]">
          <Select
            value={category}
            onChange={(e) => handleDropdownChange('category', e.target.value)}
            className="w-full bg-background"
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="wallet">Wallet</option>
            <option value="keys">Keys</option>
            <option value="id card">ID Card</option>
            <option value="books">Books</option>
            <option value="accessories">Accessories</option>
            <option value="other">Other</option>
          </Select>
        </div>

        <div className="flex-1 md:flex-none min-w-[140px]">
          <Select
            value={sort}
            onChange={(e) => handleDropdownChange('sort', e.target.value)}
            className="w-full bg-background"
          >
            <option value="latest">Sort: Latest</option>
            <option value="oldest">Sort: Oldest</option>
          </Select>
        </div>
      </div>
    </div>
  );
}
