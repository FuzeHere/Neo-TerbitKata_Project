"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

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

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

    const payload = {
      title,
      excerpt: excerpt || title.substring(0, 150) + "...",
      content,
      thumbnail,
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
              <Label htmlFor="content" className="font-semibold text-slate-700 dark:text-slate-360">Isi Artikel (Mendukung HTML)</Label>
              <Textarea
                id="content"
                required
                placeholder="Tulis isi berita Anda di sini. Anda dapat menggunakan tag HTML dasar seperti <p>, <blockquote>, <strong>, dll..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm bg-transparent border-slate-200 dark:border-slate-800 focus-visible:ring-primary"
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
          </CardContent>
        </Card>

        {/* Categories Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">Kategori</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => handleCategoryChange(cat.id)}
                  className="rounded text-primary border-slate-300 focus:ring-primary h-4 w-4"
                />
                {cat.name}
              </label>
            ))}
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
