"use client";

import React, { useState } from "react";
import { Search, RotateCcw, Trash2, Eye, Calendar, User, Clock, AlertTriangle, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface TrashItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string | null;
  deletedAt: string;
  createdAt: string;
  expiresAt: string;
  remainingLabel: string;
  isExpired: boolean;
  author: {
    id: string;
    name: string;
    avatar: string | null;
    email: string;
  };
  categories: Array<{ id: string; name: string; slug: string }>;
  tags: Array<{ id: string; name: string; slug: string }>;
}

interface TrashTableProps {
  initialItems: TrashItem[];
}

export default function TrashTable({ initialItems }: TrashTableProps) {
  const [items, setItems] = useState<TrashItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<TrashItem | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const router = useRouter();

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.author.name.toLowerCase().includes(q) ||
      item.categories.some((c) => c.name.toLowerCase().includes(q))
    );
  });

  // Action: Intervene & Restore article
  const handleRestore = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin memulihkan artikel "${title}"?\n\nArtikel akan kembali aktif dan dapat dibaca di portal.`)) {
      return;
    }

    setProcessingId(id);
    try {
      const res = await fetch(`/api/articles/trash/${id}`, {
        method: "POST",
      });

      const data = await res.json();
      if (res.ok) {
        setItems(items.filter((item) => item.id !== id));
        alert(data.message || "Artikel berhasil dipulihkan.");
        router.refresh();
      } else {
        alert(data.error || "Gagal memulihkan artikel.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan saat memulihkan artikel.");
    } finally {
      setProcessingId(null);
    }
  };

  // Action: Approve & Permanently Delete article
  const handlePermanentDelete = async (id: string, title: string) => {
    if (
      !confirm(
        `PERINGATAN: Setujui penghapusan artikel "${title}"?\n\nArtikel akan DIHAPUS PERMANEN dari database dan tidak dapat dikembalikan.`
      )
    ) {
      return;
    }

    setProcessingId(id);
    try {
      const res = await fetch(`/api/articles/trash/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setItems(items.filter((item) => item.id !== id));
        alert(data.message || "Artikel berhasil dihapus secara permanen.");
        router.refresh();
      } else {
        alert(data.error || "Gagal menghapus artikel.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan saat menghapus artikel.");
    } finally {
      setProcessingId(null);
    }
  };

  // Action: Empty Entire Trash
  const handleEmptyTrash = async () => {
    if (
      !confirm(
        `PERINGATAN KERAS: Kosongkan seluruh kotak sampah?\n\nSemua ${items.length} artikel di kotak sampah akan DIHAPUS PERMANEN dari database!`
      )
    ) {
      return;
    }

    setIsClearingAll(true);
    try {
      const res = await fetch("/api/articles/trash", {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setItems([]);
        alert(data.message || "Kotak sampah berhasil dikosongkan.");
        router.refresh();
      } else {
        alert(data.error || "Gagal mengosongkan kotak sampah.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan saat mengosongkan kotak sampah.");
    } finally {
      setIsClearingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info Banner */}
      <div className="bg-slate-100 dark:bg-slate-850/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Mekanisme Intervensi Admin & Retensi 3 Hari
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Artikel yang dihapus oleh penulis ditarik dari web dan masuk ke sini. Admin dapat melakukan{" "}
              <strong className="text-primary">Intervensi (Pulihkan)</strong> untuk membatalkan penghapusan atau{" "}
              <strong className="text-rose-500">Setujui Penghapusan</strong> untuk menghapus permanen. Artikel yang tidak
              dipulihkan akan terhapus otomatis setelah 3 hari (72 jam).
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            disabled={isClearingAll}
            onClick={handleEmptyTrash}
            className="shrink-0 text-xs gap-1.5 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Kosongkan Kotak Sampah
          </Button>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Table Header / Search */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute inset-y-0 left-3 h-4 w-4 text-slate-400 my-auto" />
            <Input
              type="text"
              placeholder="Cari artikel atau penulis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {filteredItems.length} dari {items.length} artikel di kotak sampah
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-900/10 text-xs">
                <th className="py-3 px-5">Artikel</th>
                <th className="py-3 px-5">Penulis</th>
                <th className="py-3 px-5">Tanggal Masuk Sampah</th>
                <th className="py-3 px-5">Batas Retensi Otomatis</th>
                <th className="py-3 px-5 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CheckCircle className="h-8 w-8 text-emerald-500/70" />
                      <p className="font-semibold text-sm">Kotak Sampah Kosong</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Tidak ada artikel yang sedang menunggu persetujuan penghapusan. Semua artikel portal dalam kondisi aman.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors"
                  >
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1 max-w-sm sm:max-w-md">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {item.title}
                        </span>
                        <p className="text-xs text-slate-500 line-clamp-1">{item.excerpt}</p>
                        <div className="flex gap-1 flex-wrap mt-0.5">
                          {item.categories.map((c) => (
                            <span
                              key={c.id}
                              className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {item.author.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="font-medium truncate">{item.author.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{item.author.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5 text-slate-500 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{formatDate(item.deletedAt)}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{item.remainingLabel}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewItem(item)}
                          className="h-8 px-2.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Lihat Pratinjau Artikel"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Pratinjau
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={processingId === item.id}
                          onClick={() => handleRestore(item.id, item.title)}
                          className="h-8 px-2.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer"
                          title="Intervensi & Pulihkan Artikel"
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1" />
                          Pulihkan
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={processingId === item.id}
                          onClick={() => handlePermanentDelete(item.id, item.title)}
                          className="h-8 px-2.5 text-xs cursor-pointer"
                          title="Setujui Penghapusan Permanen"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Hapus Permanen
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

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full inline-block mb-1">
                  Status: Di Kotak Sampah
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                  {previewItem.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm text-slate-800 dark:text-slate-200">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pb-2 border-b border-border">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> Penulis: {previewItem.author.name}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Dibuat: {formatDate(previewItem.createdAt)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-rose-500 font-semibold">
                  <Clock className="h-3.5 w-3.5" /> Dihapus: {formatDate(previewItem.deletedAt)}
                </span>
              </div>

              {previewItem.thumbnail && (
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-800">
                  <img
                    src={previewItem.thumbnail}
                    alt={previewItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {previewItem.excerpt && (
                <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium italic text-slate-700 dark:text-slate-300">
                  {previewItem.excerpt}
                </div>
              )}

              <div
                className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: previewItem.content }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Retensi otomatis: <strong className="text-amber-600 dark:text-amber-400">{previewItem.remainingLabel}</strong>
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewItem(null)}
                  className="text-xs cursor-pointer"
                >
                  Tutup
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const item = previewItem;
                    setPreviewItem(null);
                    handleRestore(item.id, item.title);
                  }}
                  className="text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-50 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Pulihkan Artikel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const item = previewItem;
                    setPreviewItem(null);
                    handlePermanentDelete(item.id, item.title);
                  }}
                  className="text-xs cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Hapus Permanen
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
