# TerbitKata - Portal Berita Digital

TerbitKata adalah platform portal berita digital premium independen yang responsif, berkinerja tinggi, dan ramah SEO, dibangun menggunakan Next.js 15/16, Tailwind CSS, Prisma ORM, dan PostgreSQL.

---

## Fitur Utama

- **Premium & Responsive UI**: Desain modern dengan dukungan dark mode, grid artikel dinamis, hero banner, dan sub-navigasi khusus mobile yang dapat di-scroll secara horizontal.
- **CMS Admin Panel**: Fitur manajemen lengkap (CRUD Artikel, Kategori, Tag, moderasi komentar, dan pengelolaan user penulis) dengan hak akses berbasis peran (Role: SUPER_ADMIN dan WRITER).
- **Highlight Utama**: Pilihan untuk menyorot artikel penting (`isFeatured`) sebagai berita utama di homepage dengan mekanisme auto-reset.
- **Sistem Komentar & CAPTCHA**: Fitur komentar publik yang dilengkapi verifikasi Math CAPTCHA berbasis HMAC SHA256 stateless untuk mencegah spam, serta penyaringan kata-kata kasar otomatis.
- **SEO & Google News Ready**: Dilengkapi dengan RSS Feed dinamis (`/feed.xml`), Sitemap dinamis (`/sitemap.xml`), dan Structured Data JSON-LD (`NewsArticle`).
- **TDD (Test-Driven Development)**: Pengujian unit test mandiri menggunakan Vitest untuk utilitas pembuatan slug, estimasi waktu baca, filter spam, dan token CAPTCHA.

---

## Cara Menjalankan

### 1. Kebutuhan Sistem
- Node.js (v18 ke atas)
- PostgreSQL (dapat dijalankan via Docker)

### 2. Pengaturan Environment
Salin berkas `.env.example` menjadi `.env` dan sesuaikan nilainya:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/terbitkata?schema=public"
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"
CAPTCHA_SECRET="your_captcha_hmac_secret_here"
SPAM_KEYWORDS="badword1,badword2,spammytext"
```

### 3. Instalasi & Migrasi Database
```bash
# Instal dependensi
npm install

# Jalankan database PostgreSQL lokal menggunakan Docker
docker-compose up -d

# Terapkan migrasi database dan seeding data admin/artikel default
npx prisma db push
npx prisma db seed
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) untuk mengakses portal publik. Untuk login admin, buka tautan langsung ke `/login` menggunakan akun:
* **Email**: `admin@terbitkata.com`
* **Password**: `AdminTerbitKata2026!`

---

## Pengujian TDD (Unit Testing)

Untuk menjalankan seluruh unit test menggunakan Vitest:
```bash
npm run test
```

---

## Dokumentasi Pembaruan Hari Ini (15 Juni 2026)

Hari ini telah dilakukan serangkaian perbaikan bug, optimalisasi responsivitas mobile, peningkatan keamanan, serta penambahan fitur sebagai berikut:

### 1. Migrasi Asinkron Next.js 15+ (Params Resolution)
* Mengubah parameter rute `params` dan `searchParams` di seluruh Server Components dan API Route Handlers menjadi bertipe `Promise` dan mengimplementasikan `await`. Ini mengatasi galat `PrismaClientValidationError` saat memuat halaman detail artikel.
* Menghapus file `src/app/page.tsx` root yang redundant agar homepage dapat merujuk langsung ke `src/app/(public)/page.tsx` dan memuat header serta footer portal secara default.

### 2. Optimalisasi Responsivitas Mobile
* **Horizontal Overflow**: Menghilangkan luapan horizontal pada gambar featured hero di perangkat seluler dengan mengatur `aspect-ratio` responsif dan menonaktifkan batasan tinggi minimum desktop.
* **Grid Kategori**: Menyusun navigasi kategori agar vertikal bertumpuk di layar ponsel kecil (`grid-cols-1`) dan melebar secara cerdas pada layar tablet/desktop.
* **Mobile Sub-Navigation**: Menyematkan bilah navigasi horizontal scrollable khusus mobile di bawah header utama untuk memudahkan perpindahan kanal berita.

### 3. Peningkatan Keamanan & Desain Sistem
* **Sembunyikan Akses Login**: Menghapus tombol masuk ("Masuk" / "Dashboard") dari header halaman utama. Login portal sekarang bersifat privat dan hanya dapat diakses melalui URL `/login`.
* **Fix React Key Warning**: Menyertakan select field `id` pada pemanggilan database relasi kategori di tabel manajemen admin (`ArticleTable.tsx`) dan halaman detail artikel untuk menjamin React key prop yang unik.

### 4. Fitur Sorot/Highlight Berita Utama
* Memodifikasi Prisma schema untuk menyertakan field boolean `isFeatured` pada model `Article`.
* Mengintegrasikan checkbox "Sorot Berita" pada formulir pembuatan/edit artikel di Admin Panel.
* Menyematkan fitur *auto-reset* pada endpoint backend agar sistem otomatis mematikan status sorotan artikel lama ketika artikel baru disorot.
* Memperbarui homepage utama agar memprioritaskan artikel tersorot di bagian Hero Section dengan mekanisme filter pencegahan duplikasi artikel di daftar grid bawahnya.
