"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Edit2, Trash2, Plus, Tag as TagIcon, Folder, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface CategoryTagManagerProps {
  initialCategories: any[];
  initialTags: any[];
}

export default function CategoryTagManager({
  initialCategories,
  initialTags,
}: CategoryTagManagerProps) {
  const router = useRouter();

  // State
  const [categories, setCategories] = useState(initialCategories);
  const [tags, setTags] = useState(initialTags);

  // Form State
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [tagName, setTagName] = useState("");

  // Edit Mode States
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");

  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState("");

  // Loaders
  const [loading, setLoading] = useState(false);

  // --- CATEGORY ACTIONS ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: catName, description: catDesc }),
      });

      const data = await res.json();
      if (res.ok) {
        setCategories([...categories, { ...data, _count: { articles: 0 } }]);
        setCatName("");
        setCatDesc("");
        alert("Kategori berhasil ditambahkan.");
        router.refresh();
      } else {
        alert(data.error || "Gagal menambah kategori.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (cat: any) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || "");
  };

  const handleSaveCategory = async (id: string) => {
    if (!editCatName.trim()) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editCatName, description: editCatDesc }),
      });

      const data = await res.json();
      if (res.ok) {
        setCategories(
          categories.map((c) => (c.id === id ? { ...c, name: editCatName, description: editCatDesc } : c))
        );
        setEditingCatId(null);
        alert("Kategori berhasil diperbarui.");
        router.refresh();
      } else {
        alert(data.error || "Gagal memperbarui kategori.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
        alert("Kategori berhasil dihapus.");
        router.refresh();
      } else {
        alert(data.error || "Gagal menghapus kategori.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    }
  };

  // --- TAG ACTIONS ---
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tagName }),
      });

      const data = await res.json();
      if (res.ok) {
        setTags([...tags, { ...data, _count: { articles: 0 } }]);
        setTagName("");
        alert("Tag berhasil ditambahkan.");
        router.refresh();
      } else {
        alert(data.error || "Gagal menambah tag.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTag = (tag: any) => {
    setEditingTagId(tag.id);
    setEditTagName(tag.name);
  };

  const handleSaveTag = async (id: string) => {
    if (!editTagName.trim()) return;

    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editTagName }),
      });

      const data = await res.json();
      if (res.ok) {
        setTags(tags.map((t) => (t.id === id ? { ...t, name: editTagName } : t)));
        setEditingTagId(null);
        alert("Tag berhasil diperbarui.");
        router.refresh();
      } else {
        alert(data.error || "Gagal memperbarui tag.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tag ini?")) return;

    try {
      const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        setTags(tags.filter((t) => t.id !== id));
        alert("Tag berhasil dihapus.");
        router.refresh();
      } else {
        alert(data.error || "Gagal menghapus tag.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Category Manager Column */}
      <div className="space-y-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Folder className="h-5 w-5 text-primary" />
              Tambah Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="catName" className="text-xs">Nama Kategori</Label>
                <Input
                  id="catName"
                  placeholder="Misal: Politik, Ekonomi..."
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="bg-transparent border-slate-200 dark:border-slate-800 h-9 focus-visible:ring-primary text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="catDesc" className="text-xs">Deskripsi (Opsional)</Label>
                <Textarea
                  id="catDesc"
                  placeholder="Deskripsi singkat mengenai topik kategori ini..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="bg-transparent border-slate-200 dark:border-slate-800 min-h-[60px] text-xs focus-visible:ring-primary"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary text-white h-9 text-xs cursor-pointer">
                Tambah Kategori
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Category List */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">Daftar Kategori</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Belum ada kategori yang dibuat.</p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg flex items-start justify-between gap-4 bg-slate-50/30 dark:bg-slate-900/10 hover:border-slate-200 dark:hover:border-slate-700 transition"
                >
                  {editingCatId === cat.id ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        className="h-8 bg-transparent text-xs"
                      />
                      <Textarea
                        value={editCatDesc}
                        onChange={(e) => setEditCatDesc(e.target.value)}
                        className="min-h-[50px] bg-transparent text-xs"
                      />
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          onClick={() => handleSaveCategory(cat.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 w-7 p-0 cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditingCatId(null)}
                          className="h-7 w-7 p-0 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{cat.name}</span>
                          <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {cat._count?.articles} Artikel
                          </span>
                        </div>
                        {cat.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{cat.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCategory(cat)}
                          className="h-7 w-7 text-slate-500 hover:text-primary cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="h-7 w-7 text-rose-500 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tag Manager Column */}
      <div className="space-y-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TagIcon className="h-5 w-5 text-primary" />
              Tambah Tag Berita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTag} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="tagName" className="text-xs">Nama Tag</Label>
                <Input
                  id="tagName"
                  placeholder="Misal: Pilkada, Makassar, Ekspor..."
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  className="bg-transparent border-slate-200 dark:border-slate-800 h-9 focus-visible:ring-primary text-xs"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary text-white h-9 text-xs cursor-pointer">
                Tambah Tag
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tag List */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">Daftar Tag</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tags.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Belum ada tag yang dibuat.</p>
            ) : (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="p-2.5 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between gap-3 bg-slate-50/30 dark:bg-slate-900/10 hover:border-slate-200 dark:hover:border-slate-700 transition"
                  >
                    {editingTagId === tag.id ? (
                      <div className="flex-1 flex items-center gap-1">
                        <Input
                          value={editTagName}
                          onChange={(e) => setEditTagName(e.target.value)}
                          className="h-8 bg-transparent text-xs"
                        />
                        <Button
                          type="button"
                          onClick={() => handleSaveTag(tag.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 w-7 p-0 cursor-pointer"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditingTagId(null)}
                          className="h-7 w-7 p-0 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <TagIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-xs truncate">{tag.name}</span>
                          <span className="text-[8px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                            {tag._count?.articles}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTag(tag)}
                            className="h-7 w-7 text-slate-500 hover:text-primary cursor-pointer"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTag(tag.id)}
                            className="h-7 w-7 text-rose-500 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
