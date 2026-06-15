"use client";

import React, { useState } from "react";
import { Search, Edit, Trash2, ExternalLink, Calendar, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ArticleTableProps {
  initialArticles: any[];
}

export default function ArticleTable({ initialArticles }: ArticleTableProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  // Filter articles based on search query
  const filteredArticles = articles.filter((article) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(searchLower) ||
      article.author.name.toLowerCase().includes(searchLower) ||
      article.categories.some((cat: any) => cat.name.toLowerCase().includes(searchLower))
    );
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel ini secara permanen?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setArticles(articles.filter((art) => art.id !== id));
        alert("Artikel berhasil dihapus.");
        router.refresh();
      } else {
        alert(data.error || "Gagal menghapus artikel.");
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi saat menghapus.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Table Header / Search */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute inset-y-0 left-3 h-4 w-4 text-slate-400 my-auto" />
          <Input
            type="text"
            placeholder="Cari artikel, penulis, atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Menampilkan {filteredArticles.length} dari {articles.length} artikel
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-900/10">
              <th className="py-3 px-5">Artikel</th>
              <th className="py-3 px-5">Kategori</th>
              <th className="py-3 px-5">Tanggal</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-500">
                  Tidak ada artikel yang cocok dengan pencarian Anda.
                </td>
              </tr>
            ) : (
              filteredArticles.map((article) => (
                <tr
                  key={article.id}
                  className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors"
                >
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-1 max-w-md">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 hover:text-primary transition line-clamp-1">
                        {article.title}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {article.author.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex gap-1 flex-wrap">
                      {article.categories.map((cat: any) => (
                        <span
                          key={cat.id}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-500">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {formatDate(article.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block ${
                        article.publishedAt
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {article.publishedAt ? "Dipublikasikan" : "Draft"}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {article.publishedAt && (
                        <Link
                          href={`/${article.categories[0]?.slug || "berita"}/${article.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                          title="Lihat Halaman Publik"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <Link
                        href={`/admin/articles/edit/${article.id}`}
                        className="p-1.5 text-slate-450 hover:text-primary transition"
                        title="Edit Artikel"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === article.id}
                        onClick={() => handleDelete(article.id)}
                        className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                        title="Hapus Artikel"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
