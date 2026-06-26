"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Save } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setAvatar((session.user as any).avatar || "");
    }
  }, [session]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setAvatar(data.url);
      } else {
        setMessage({ type: "error", text: data.error || "Gagal mengunggah gambar." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi saat mengunggah." });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim() || !email.trim()) {
      setMessage({ type: "error", text: "Nama dan email wajib diisi." });
      return;
    }

    if (password) {
      if (password.length < 6) {
        setMessage({ type: "error", text: "Password minimal 6 karakter." });
        return;
      }
      if (password !== confirmPassword) {
        setMessage({ type: "error", text: "Konfirmasi password tidak cocok." });
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          avatar,
          password: password || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update NextAuth session cookie
        await update({
          name: data.name,
          email: data.email,
          avatar: data.avatar,
        });

        setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
        setPassword("");
        setConfirmPassword("");
        
        // Refresh router so layout (sidebar) gets latest server-side session
        router.refresh();
      } else {
        setMessage({ type: "error", text: data.error || "Gagal memperbarui profil." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi sistem." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Profil</h1>
        <p className="text-muted-foreground">Perbarui informasi akun dan foto profil Anda di sini.</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div
              className={`p-4 text-sm rounded-lg font-medium border ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-500"
              }`}
            >
              {message.text}
            </div>
          )}

          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Informasi Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="space-y-2">
                <Label className="font-semibold text-slate-700">Foto Profil / Avatar</Label>
                <div className="flex items-center gap-4">
                  {avatar ? (
                    <div className="relative h-20 w-20 rounded-full overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={avatar} alt="Avatar preview" className="object-cover h-full w-full" />
                      <button
                        type="button"
                        onClick={() => setAvatar("")}
                        className="absolute inset-0 bg-black/45 hover:bg-black/60 flex items-center justify-center text-white transition cursor-pointer"
                        title="Hapus foto"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50">
                      {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                      ) : (
                        <Upload className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="avatar-upload"
                        className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer transition"
                      >
                        Unggah Foto
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploading}
                        />
                      </Label>
                    </div>
                    <p className="text-[10px] text-slate-500">PNG, JPG atau JPEG. Maks 5MB.</p>
                  </div>
                </div>
                <Input
                  type="text"
                  placeholder="Atau masukkan URL gambar langsung..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="text-xs bg-transparent border-slate-200 mt-2 focus-visible:ring-primary"
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold text-slate-700">Nama Lengkap</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="Nama Lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent border-slate-200 focus-visible:ring-primary"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-slate-700">Alamat Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-slate-200 focus-visible:ring-primary"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Ubah Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-500">Kosongkan kolom di bawah jika Anda tidak ingin mengubah password.</p>
              
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold text-slate-700">Password Baru</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password Baru (min 6 karakter)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-slate-200 focus-visible:ring-primary"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-semibold text-slate-700">Konfirmasi Password Baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi Password Baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-transparent border-slate-200 focus-visible:ring-primary"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting || uploading}
              className="bg-primary text-white font-medium hover:bg-primary/95 shadow-md shadow-primary/10 h-10 px-6 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menyimpan Perubahan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
