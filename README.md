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
DATABASE_URL="postgresql://username:password@localhost:5432/terbitkata?schema=public"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
SPAM_KEYWORDS="slot online,judi online"
```

### 3. Instalasi & Migrasi Database (Lokal)
```bash
# Instal dependensi
npm install

# Jalankan database PostgreSQL lokal menggunakan Docker
docker-compose up -d

# Terapkan migrasi database dan seeding data bawaan
npx prisma db push
npx prisma db seed
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) untuk mengakses portal publik.

Untuk mengakses Admin Panel, buka halaman `/login` menggunakan akun administrator yang telah dikonfigurasi saat inisialisasi database (`prisma/seed.ts`).

---

## Pengujian TDD (Unit Testing)

Untuk menjalankan seluruh unit test menggunakan Vitest:
```bash
npm run test
```
