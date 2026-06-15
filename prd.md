# Product Requirements Document (PRD)

# TerbitKata

Versi: 1.0
Status: Draft
Tanggal: Juni 2026

---

# 1. Ringkasan Produk

TerbitKata adalah portal berita digital modern yang berfokus pada berita Sulawesi, politik, dan ekonomi. Platform ini ditujukan untuk memberikan informasi yang akurat, cepat, dan mudah diakses oleh masyarakat Sulawesi dengan pengalaman membaca yang nyaman di berbagai perangkat.

TerbitKata mengutamakan kualitas artikel, optimasi SEO, kemudahan pengelolaan konten, serta fondasi teknologi yang dapat berkembang di masa depan.

---

# 2. Tujuan Produk

## Tujuan Bisnis

* Menjadi media digital regional terpercaya di Sulawesi.
* Mendapatkan minimal 1.000 pengunjung per bulan pada fase awal.
* Memenuhi persyaratan monetisasi Google AdSense.
* Menjadi platform yang menarik bagi sponsor lokal dan regional.

## Tujuan Pengguna

* Mendapatkan berita terbaru terkait Sulawesi.
* Mengakses informasi politik dan ekonomi daerah dengan cepat.
* Membaca artikel dengan tampilan yang nyaman dan modern.
* Menemukan berita yang relevan melalui pencarian dan kategori.

---

# 3. Target Audiens

## Demografi

* Lokasi: Sulawesi, Indonesia
* Usia: 30–60 tahun
* Bahasa: Indonesia

## Profil Pembaca

* Masyarakat umum
* ASN
* Akademisi
* Pelaku usaha
* Profesional
* Tokoh masyarakat

---

# 4. Ruang Lingkup Produk

## Topik Utama

* Politik
* Ekonomi
* Sulawesi

## Topik yang Tidak Menjadi Fokus

* Fashion
* Hiburan selebriti
* Gosip
* Konten viral tanpa nilai berita

---

# 5. User Role

## Super Admin

Hak akses:

* Mengelola seluruh artikel
* Mengelola kategori
* Mengelola tag
* Mengelola komentar
* Mengelola akun writer
* Melihat statistik website

## Writer

Hak akses:

* Membuat artikel
* Mengedit artikel miliknya sendiri
* Menghapus artikel miliknya sendiri
* Mengunggah gambar artikel

---

# 6. Fitur MVP

## Frontend

### Homepage

Menampilkan:

* Hero News
* Berita Terbaru
* Berita Populer
* Kategori Politik
* Kategori Ekonomi
* Kategori Sulawesi
* Newsletter Section

### Halaman Artikel

Menampilkan:

* Judul
* Thumbnail
* Nama Penulis
* Tanggal Publikasi
* Reading Time
* Isi Artikel
* Tag
* Share Button
* Related Articles
* Komentar

### Halaman Kategori

Menampilkan daftar artikel berdasarkan kategori.

### Search

Pengguna dapat mencari artikel berdasarkan kata kunci.

### Newsletter

Pengunjung dapat mendaftarkan email untuk menerima informasi terbaru.

---

## Admin Panel

### Dashboard

Menampilkan:

* Total Artikel
* Total Kategori
* Total Komentar
* Artikel Terbaru

### Manajemen Artikel

Fitur:

* Create
* Read
* Update
* Delete

Field Artikel:

* Judul
* Slug
* Thumbnail
* Ringkasan
* Isi Artikel
* Kategori
* Tag
* SEO Title
* Meta Description

### Manajemen Kategori

Fitur CRUD kategori.

### Manajemen Tag

Fitur CRUD tag.

### Manajemen Komentar

Fitur:

* Approve
* Reject
* Delete

### Manajemen User

Fitur:

* Tambah Writer
* Edit Writer
* Hapus Writer

---

# 7. Struktur URL

Contoh:

/politik/judul-artikel

/ekonomi/judul-artikel

/sulawesi/judul-artikel

Kategori harus menjadi bagian dari URL untuk mendukung SEO.

---

# 8. SEO Requirements

## Wajib

* Sitemap XML otomatis
* robots.txt otomatis
* Canonical URL
* Open Graph
* Twitter Card
* Meta Title
* Meta Description

## Google News

* NewsArticle Schema
* RSS Feed
* Structured Data JSON-LD

## Performa

Target:

* Lighthouse Performance > 90
* SEO Score > 90
* Accessibility > 85

---

# 9. Komentar

Pengunjung dapat berkomentar tanpa akun.

Persyaratan:

* CAPTCHA
* Rate Limiting
* Anti Spam Filter
* Moderasi oleh Admin

Komentar dengan indikasi spam akan ditahan sebelum tampil.

---

# 10. Newsletter

Fitur awal:

* Input email
* Penyimpanan email subscriber

Belum mencakup:

* Email marketing automation
* Newsletter scheduling

---

# 11. Non Functional Requirements

## Security

* Authentication berbasis session
* Password hashing
* CSRF protection
* Rate limiting
* Input validation

## Performance

* Server-side rendering
* Image optimization
* Lazy loading
* CDN image delivery melalui Cloudinary

## Availability

Target uptime:

99%

---

# 12. Teknologi

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Shadcn UI

## Backend

* Next.js Route Handlers

## Database

* PostgreSQL

## ORM

* Prisma

## Storage

* Cloudinary

## Authentication

* NextAuth

## Deployment

* Docker
* Docker Compose
* Nginx
* VPS Indonesia

---

# 13. Struktur Database Awal

## users

* id
* name
* email
* password
* role
* avatar
* created_at
* updated_at

## articles

* id
* title
* slug
* excerpt
* content
* thumbnail
* author_id
* published_at
* created_at
* updated_at

## categories

* id
* name
* slug
* description

## tags

* id
* name
* slug

## article_categories

* article_id
* category_id

## article_tags

* article_id
* tag_id

## comments

* id
* article_id
* name
* email
* content
* status
* created_at

## newsletter_subscribers

* id
* email
* created_at

---

# 14. Success Metrics

## 3 Bulan Pertama

* Website online dan stabil
* 50+ artikel dipublikasikan
* 1.000 visitor per bulan
* Terindeks Google

## 6 Bulan Pertama

* 200+ artikel
* 5.000 visitor per bulan
* Google AdSense aktif

## 12 Bulan Pertama

* 10.000+ visitor per bulan
* Sponsor pertama
* Menjadi referensi berita regional Sulawesi

---

# 15. Future Features

Tidak termasuk MVP:

* Mobile App
* Multi Bahasa
* AI Content Assistant
* Membership Premium
* Push Notification
* Podcast
* Video News
* Live Streaming
* Mobile Application

---

End of Document
