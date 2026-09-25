"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Loader2, ArrowLeft, Plus, FolderPlus } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface ArticleFormProps {
  categories: any[];
  tags: any[];
  article?: any; // If editing
}

export default function ArticleForm({ categories, tags, article }: ArticleFormProps) {
  const router = useRouter();
  const isEdit = !!article;

  const [title, setTitle] = useState(article?.title || "");
  const [excerpt, setExcerpt] = useState(article?.excerpt || "");
  const [content, setContent] = useState(article?.content || "");
  const [thumbnail, setThumbnail] = useState(article?.thumbnail || "");
  const [thumbnailCaption, setThumbnailCaption] = useState(article?.thumbnailCaption || "");
  const [categoryList, setCategoryList] = useState<any[]>(categories || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    article?.categories?.map((c: any) => c.id) || []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    article?.tags?.map((t: any) => t.id) || []
  );
  const [isPublished, setIsPublished] = useState<boolean>(
    article ? !!article.publishedAt : true
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(
    article ? !!article.isFeatured : false
  );

  // New Category inline creation state
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryActionError, setCategoryActionError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreateNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCreatingCategory(true);
    setCategoryActionError("");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          description: newCatDesc.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Add to local category list
        setCategoryList((prev) => [...prev, data]);
        // Automatically select the newly created category
        setSelectedCategories((prev) => [...prev, data.id]);
        // Reset form
        setNewCatName("");
        setNewCatDesc("");
        setShowAddCategory(false);
      } else {
        setCategoryActionError(data.error || "Gagal membuat kategori baru");
      }
    } catch (err) {
      setCategoryActionError("Terjadi kesalahan jaringan saat menambah kategori");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setThumbnail(data.url);
      } else {
        setError(data.error || "Gagal mengunggah gambar.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi saat mengunggah.");
    } finally {
      setUploading(false);
    }
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleTagChange = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (selectedCategories.length === 0) {
      setError("Pilih minimal satu kategori.");
      setSubmitting(false);
      return;
    }

    const cleanText = content.replace(/<[^>]*>/g, "").trim();
    if (!content || cleanText.length < 10) {
      setError("Isi artikel minimal 10 karakter.");
      setSubmitting(false);
      return;
    }

    const payload = {
      title,
      excerpt: excerpt || title.substring(0, 150) + "...",
      content,
      thumbnail,
      thumbnailCaption,
      categoryIds: selectedCategories,
      tagIds: selectedTags,
      isPublished,
      isFeatured,
    };

    try {
      const url = isEdit ? `/api/articles/${article.id}` : "/api/articles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/articles");
        router.refresh();
      } else {
        setError(data.error || "Gagal menyimpan artikel.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi sistem.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3">
      {/* Left Column: Form Fields */}
      <div className="md:col-span-2 space-y-6">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg p-4 text-sm font-medium">
            {error}
          </div>
        )}

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6 space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold text-slate-700 dark:text-slate-350">Judul Artikel</Label>
              <Input
                id="title"
                required
                placeholder="Masukkan judul artikel yang menarik..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-transparent border-slate-200 dark:border-slate-800 focus-visible:ring-primary text-base py-5"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt" className="font-semibold text-slate-700 dark:text-slate-355">Ringkasan / Excerpt</Label>
              <Textarea
                id="excerpt"
                placeholder="Tulis ringkasan singkat artikel untuk halaman depan..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="min-h-[80px] bg-transparent border-slate-200 dark:border-slate-800 focus-visible:ring-primary"
              />
            </div>

            {/* Content Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content" className="font-semibold text-slate-700 dark:text-slate-300">
                  Isi Artikel
                </Label>
                <span className="text-xs text-slate-400">
                  WYSIWYG Editor (Mendukung Heading, List, Link &amp; Baca Juga)
                </span>
              </div>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Tulis isi berita Anda di sini. Gunakan toolbar untuk formatting dan menyisipkan tautan..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Settings & Meta */}
      <div className="space-y-6">
        {/* Publish Action Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">Publikasi & Sorotan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status Publikasi</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublished(false)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                    !isPublished
                      ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      : "border-transparent text-slate-400"
                  }`}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublished(true)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                    isPublished
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "border-transparent text-slate-400"
                  }`}
                >
                  Publish
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4">
              <div>
                <span className="text-sm font-medium block">Sorot Berita</span>
                <span className="text-[10px] text-slate-500 block">Tampilkan sebagai berita utama di homepage</span>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-primary border-slate-300 focus:ring-primary h-4 w-4 cursor-pointer"
              />
            </div>

            <div className="flex gap-2">
              <Link href="/admin/articles" className="flex-1">
                <Button type="button" variant="outline" className="w-full h-9 text-xs cursor-pointer">
                  Kembali
                </Button>
              </Link>
              <Button type="submit" disabled={submitting} className="flex-1 bg-primary text-white h-9 text-xs cursor-pointer">
                {submitting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Artikel"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Thumbnail Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">Thumbnail / Gambar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {thumbnail ? (
              <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                <img src={thumbnail} alt="Thumbnail preview" className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => setThumbnail("")}
                  className="absolute top-2 right-2 bg-slate-950/70 hover:bg-slate-950 p-1.5 rounded-full text-white transition cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-350 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center bg-slate-50/50 dark:bg-slate-950/20">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-slate-450" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-slate-400" />
                    <Label
                      htmlFor="file-upload"
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Unggah berkas gambar
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </Label>
                    <p className="text-[10px] text-slate-500">PNG, JPG, JPEG maks 5MB</p>
                  </>
                )}
              </div>
            )}
            <Input
              type="text"
              placeholder="Atau masukkan URL gambar langsung..."
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="text-xs h-8 bg-transparent border-slate-200 dark:border-slate-800 focus-visible:ring-primary"
            />

            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <Label htmlFor="thumbnailCaption" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Keterangan / Deskripsi Foto
              </Label>
              <Textarea
                id="thumbnailCaption"
                rows={2}
                placeholder="Contoh: Suhasil Nazara memberikan sambutan di Gedung Kemenkeu, Jakarta. Tempo/Muhammad Zaki Fauzi"
                value={thumbnailCaption}
                onChange={(e) => setThumbnailCaption(e.target.value)}
                className="text-xs bg-transparent border-slate-200 dark:border-slate-800 focus-visible:ring-primary resize-none"
              />
              <p className="text-[10px] text-slate-500">
                Deskripsi atau sumber foto yang akan tampil tepat di bawah foto artikel.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Categories Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-bold">Kategori</CardTitle>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {selectedCategories.length} kategori dipilih
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddCategory(!showAddCategory);
                setCategoryActionError("");
              }}
              className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1 cursor-pointer bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded transition"
            >
              <Plus className="h-3.5 w-3.5" />
              {showAddCategory ? "Tutup" : "Kategori Baru"}
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Inline Add Category Form */}
            {showAddCategory && (
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary flex items-center gap-1">
                    <FolderPlus className="h-3.5 w-3.5" /> Tambah Kategori Baru
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {categoryActionError && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    {categoryActionError}
                  </p>
                )}
                <Input
                  type="text"
                  placeholder="Nama kategori baru (mis: Opini, Gaya Hidup)..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
                <Input
                  type="text"
                  placeholder="Deskripsi singkat (opsional)..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={creatingCategory || !newCatName.trim()}
                  onClick={handleCreateNewCategory}
                  className="w-full h-8 text-xs bg-primary text-white cursor-pointer font-medium"
                >
                  {creatingCategory ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      Menambahkan...
                    </>
                  ) : (
                    "Simpan & Pilih Kategori"
                  )}
                </Button>
              </div>
            )}

            {/* Selected category badges */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pb-1">
                {selectedCategories.map((id) => {
                  const cat = categoryList.find((c) => c.id === id);
                  if (!cat) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full"
                    >
                      {cat.name}
                      <button
                        type="button"
                        onClick={() => handleCategoryChange(id)}
                        className="hover:text-rose-500 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Category Checkbox List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {categoryList.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-2">
                  Belum ada kategori. Silakan buat di atas.
                </p>
              ) : (
                categoryList.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition cursor-pointer py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => handleCategoryChange(cat.id)}
                      className="rounded text-primary border-slate-300 focus:ring-primary h-4 w-4"
                    />
                    <span className="truncate">{cat.name}</span>
                  </label>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tags Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">Tag Berita</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => handleTagChange(tag.id)}
                  className="rounded text-primary border-slate-300 focus:ring-primary h-4 w-4"
                />
                {tag.name}
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
