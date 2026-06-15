"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden px-4">
      {/* Abstract Background Shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10"></div>

      <Card className="w-full max-w-md bg-slate-900/80 border-slate-800 text-slate-100 shadow-2xl backdrop-blur-md rounded-2xl p-2">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/20 text-primary w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl shadow-inner">
            TK
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">TerbitKata Admin</CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Masuk ke panel editor untuk mengelola portal berita
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg p-3 flex items-start gap-2 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 font-medium">Email Editor</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="editor@terbitkata.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-950/50 border-slate-800 focus-visible:ring-primary focus-visible:border-primary text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 font-medium">Kata Sandi</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-slate-950/50 border-slate-800 focus-visible:ring-primary focus-visible:border-primary text-slate-200"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded-lg cursor-pointer"
            >
              {loading ? "Menghubungkan..." : "Masuk Sekarang"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
