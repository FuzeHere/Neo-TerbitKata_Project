"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function HeaderSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-32 min-[400px]:w-40 sm:w-60">
      <Search className="absolute inset-y-0 left-3 h-4 w-4 text-slate-400 my-auto pointer-events-none" />
      <Input
        type="text"
        placeholder="Cari berita..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9 pr-3 h-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs rounded-full focus-visible:ring-primary focus-visible:border-primary"
      />
    </form>
  );
}
