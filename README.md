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

### 3. Instalasi & Migrasi Database (Lokal)
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

### 5. Deployment ke VPS (Produksi)
Untuk meluncurkan aplikasi ini di server produksi (VPS), ikuti langkah-langkah berikut:

1. **Persiapan Environment (`.env`)**
   Sesuaikan environment variable untuk produksi:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/terbitkata_db?schema=public"
   NEXTAUTH_URL="https://domain-anda.com"
   NEXTAUTH_SECRET="buat-random-string-secure" # Gunakan 'openssl rand -base64 32'
   ```

2. **Perintah Deploy**
   ```bash
   # 1. Install dependencies
   npm ci --production

   # 2. Generate Prisma Client
   npx prisma generate

   # 3. Jalankan migrasi database ke database produksi
   npx prisma migrate deploy

   # 4. Build aplikasi untuk versi produksi
   npm run build

   # 5. Jalankan server menggunakan PM2 agar tetap berjalan di latar belakang
   pm2 start npm --name "terbitkata-app" -- start
   ```

3. **Nginx Reverse Proxy**
   Konfigurasikan Nginx untuk mengarahkan port 80/443 ke port 3000:
   ```nginx
   server {
       listen 80;
       server_name domain-anda.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Deployment Menggunakan Portainer Community Edition**
   Anda dapat menjalankan aplikasi ini secara online secara lokal atau di VPS menggunakan Portainer CE melalui fitur **Stacks** (Docker Compose):

   #### Opsi A: Menggunakan Git Repository (Sangat Direkomendasikan)
   Metode ini akan secara otomatis mengkloning repository, mem-build Dockerfile, dan menjalankan container secara otomatis.
   1. Buka Portainer CE -> Pilih Environment -> **Stacks** -> klik **Add stack**.
   2. Beri nama stack (misal: `neo-terbitkata`).
   3. Pada bagian **Build method**, pilih **Repository**.
   4. Isi **Repository URL** dengan Git URL proyek Anda (misal: `https://github.com/FuzeHere/Neo-TerbitKata_Project.git`). *Jika repositori bersifat privat, aktifkan opsi Authentication dan masukkan Username serta Personal Access Token (PAT) GitHub Anda.*
   5. Tentukan **Repository reference** (misal `refs/heads/main`).
   6. Isi **Compose path** dengan `docker-compose.prod.yml`.
   7. Tambahkan beberapa **Environment variables** berikut pada Portainer:
      - `DATABASE_URL`: `postgresql://postgres:password@db:5432/terbitkata?schema=public`
      - `NEXTAUTH_SECRET`: `string-random-rahasia-anda`
      - `NEXTAUTH_URL`: `http://<IP_KOMPUTER_ATAU_DOMAIN>` (Gunakan IP komputer Anda agar bisa diakses oleh perangkat lain di jaringan lokal)
   8. Klik **Deploy the stack**. Portainer akan mengunduh dan membangun aplikasi.

   #### Opsi B: Menggunakan Web Editor (Deployment Manual Tanpa Git)
   Jika Anda ingin mem-deploy langsung tanpa mendorong (push) kode ke Git terlebih dahulu:
   1. Di terminal komputer host Docker Anda, lakukan build image terlebih dahulu:
      ```bash
      docker build -t terbitkata-app:latest .
      ```
   2. Buka Portainer CE -> **Stacks** -> klik **Add stack**.
   3. Pilih **Web editor**, kemudian salin isi dari `docker-compose.prod.yml`. Sesuaikan baris berikut:
      - Ubah blok `build: ...` pada service `app` menjadi `image: terbitkata-app:latest`.
      - Ubah path volume nginx `./nginx/nginx.conf` menjadi path absolut pada server host (misal: `/absolute/path/to/Neo-TerbitKata_Project/nginx/nginx.conf`).
   4. Tambahkan Environment variables seperti pada Opsi A.
   5. Klik **Deploy the stack**.

   #### Langkah Penting: Inisialisasi Database (Prisma db push & seed)
   Karena database PostgreSQL yang baru di-deploy masih kosong, jalankan perintah migrasi skema dan pengisian data bawaan (seeding) melalui komputer host Anda (di mana direktori proyek berada) dengan mengarahkan koneksi ke port database container:
   - **Di Windows (PowerShell):**
     ```powershell
     $env:DATABASE_URL="postgresql://postgres:password@localhost:5432/terbitkata?schema=public"
     npx prisma db push
     npx prisma db seed
     Remove-Item Env:\DATABASE_URL
     ```
   - **Di Linux / macOS (Bash):**
     ```bash
     DATABASE_URL="postgresql://postgres:password@localhost:5432/terbitkata?schema=public" npx prisma db push
     DATABASE_URL="postgresql://postgres:password@localhost:5432/terbitkata?schema=public" npx prisma db seed
     ```

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
