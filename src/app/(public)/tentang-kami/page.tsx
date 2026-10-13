import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ShieldCheck, Newspaper, Users, Award, MapPin } from "lucide-react";
import { Metadata } from "next";
import { getStaticBaseUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "Tentang Kami & Kontak Redaksi - TerbitKata",
  description:
    "Mengenal lebih dekat TerbitKata, visi jurnalisme berkualitas, susunan redaksi, serta kontak resmi kami di terbitkatasupport@gmail.com.",
  alternates: {
    canonical: `${getStaticBaseUrl()}/tentang-kami`,
  },
};

export default function TentangKamiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Breadcrumbs */}
      <div className="text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-primary transition">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-400">Tentang Kami</span>
      </div>

      {/* Hero Header */}
      <div className="border-b border-border pb-8 space-y-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="TerbitKata Logo"
            width={200}
            height={40}
            className="h-10 w-auto object-contain"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Jurnalisme Berkualitas, Objektif, dan Independen
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          TerbitKata adalah portal berita digital modern yang menyajikan informasi aktual dan mendalam seputar politik, ekonomi, pembangunan daerah, dan dinamika sosial nusantara, khususnya kawasan Sulawesi.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl border border-border bg-card space-y-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Independen & Kredibel</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Menjunjung tinggi kode etik jurnalistik dengan verifikasi berlapis sebelum informasi dipublikasikan.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card space-y-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Newspaper className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Aktual & Terpercaya</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Menyajikan berita terkini dan analisis tajam dengan perspektif berimbang dan komprehensif.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card space-y-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Fokus Daerah</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Menjadi jembatan aspirasi masyarakat dan pembangunan regional Sulawesi menuju kemajuan bersama.
          </p>
        </div>
      </div>

      {/* Hubungi Kami Section */}
      <section className="rounded-2xl border border-border bg-slate-50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Kontak & Layanan Pembaca
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Punya pertanyaan, koreksi berita, kerja sama media, atau pengiriman opini? Hubungi kami langsung:
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Email Resmi Redaksi & Dukungan:</span>
              <a
                href="mailto:terbitkatasupport@gmail.com"
                className="text-sm font-bold text-primary hover:underline break-all"
              >
                terbitkatasupport@gmail.com
              </a>
              <p className="text-[11px] text-slate-500 mt-1">
                Layanan pembaca aktif setiap hari kerja (Senin - Sabtu).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Pengiriman Artikel Opini:</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Redaksi TerbitKata
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Kirim naskah artikel atau opini Anda ke email resmi kami di atas dengan subjek [OPINI].
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pedoman Media Siber */}
      <section className="space-y-3 pt-4 border-t border-border">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Pedoman Pemberitaan & Hak Jawab
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          TerbitKata tunduk pada Undang-Undang Pers No. 40 Tahun 1999 dan Pedoman Pemberitaan Media Siber yang ditetapkan oleh Dewan Pers. Kami melayani Hak Jawab dan Hak Koreksi dari pihak-pihak yang merasa dirugikan oleh materi pemberitaan kami. Silakan sampaikan melalui kontak email <a href="mailto:terbitkatasupport@gmail.com" className="font-semibold text-primary hover:underline">terbitkatasupport@gmail.com</a>.
        </p>
      </section>
    </div>
  );
}
