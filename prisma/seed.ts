import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Create Default Super Admin
  const adminEmail = 'admin@terbitkata.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  let adminId = '';
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('AdminTerbitKata2026!', 10);
    const admin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
      },
    });
    adminId = admin.id;
    console.log('Default Super Admin created!');
  } else {
    adminId = existingAdmin.id;
    console.log('Super Admin already exists.');
  }

  // 2. Create Default Categories
  const categories = [
    { name: 'Politik', slug: 'politik', description: 'Berita politik lokal dan regional Sulawesi' },
    { name: 'Ekonomi', slug: 'ekonomi', description: 'Berita ekonomi, bisnis, dan investasi di Sulawesi' },
    { name: 'Sulawesi', slug: 'sulawesi', description: 'Kabar umum dan peristiwa penting di wilayah Sulawesi' },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.slug] = upserted.id;
  }
  console.log('Default categories created/verified.');

  // 3. Create Default Tags
  const tags = [
    { name: 'Pilkada', slug: 'pilkada' },
    { name: 'Investasi', slug: 'investasi' },
    { name: 'Makassar', slug: 'makassar' },
    { name: 'Manado', slug: 'manado' },
    { name: 'Palu', slug: 'palu' },
    { name: 'Kendari', slug: 'kendari' },
    { name: 'Gorontalo', slug: 'gorontalo' },
  ];

  const tagMap: Record<string, string> = {};
  for (const tag of tags) {
    const upserted = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
    tagMap[tag.slug] = upserted.id;
  }
  console.log('Default tags created/verified.');

  // 4. Create Initial Sample Articles
  const articlesCount = await prisma.article.count();
  if (articlesCount === 0) {
    const sampleArticles = [
      {
        title: 'Pilkada Serentak Sulawesi 2026: Dinamika Politik Menjelang Pendaftaran',
        slug: 'pilkada-serentak-sulawesi-2026-dinamika-politik-menjelang-pendaftaran',
        excerpt: 'Dinamika politik menjelang pendaftaran Pilkada Serentak 2026 di berbagai provinsi di Sulawesi semakin hangat dengan munculnya koalisi baru.',
        content: `
          <p>Pilkada Serentak 2026 yang akan diselenggarakan beberapa bulan lagi mulai menunjukkan dinamika politik yang menarik di wilayah Sulawesi. Partai-partai politik mulai mematangkan strategi koalisi dan mempersiapkan nama-nama bakal calon kepala daerah.</p>
          <p>Di Sulawesi Selatan, poros koalisi baru mulai terbentuk untuk menantang petahana. Pengamat politik menilai bahwa faktor figuritas dan keterwakilan daerah pemilihan (dapil) masih menjadi penentu utama dalam membangun elektabilitas pasangan calon.</p>
          <p>Sementara itu, di Sulawesi Utara dan Sulawesi Tengah, isu-isu terkait pembangunan infrastruktur daerah dan pengelolaan sumber daya alam menjadi jualan utama para kandidat untuk menarik simpati pemilih muda yang porsinya cukup besar di pemilu kali ini.</p>
          <blockquote>"Peta koalisi masih sangat dinamis dan kemungkinan berubah sebelum pendaftaran resmi di KPU," ujar salah satu perwakilan koalisi partai di Makassar.</blockquote>
          <p>Masyarakat diharapkan terus memantau rekam jejak para calon demi melahirkan pemimpin yang mampu membawa kemajuan bagi pembangunan di Sulawesi.</p>
        `,
        thumbnail: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&h=450&q=80',
        authorId: adminId,
        publishedAt: new Date(),
        categories: { connect: [{ id: categoryMap['politik'] }, { id: categoryMap['sulawesi'] }] },
        tags: { connect: [{ id: tagMap['pilkada'] }, { id: tagMap['makassar'] }] }
      },
      {
        title: 'Pertumbuhan Investasi Hijau di Morowali Mencapai Rekor Baru',
        slug: 'pertumbuhan-investasi-hijau-di-morowali-mencapai-rekor-baru',
        excerpt: 'Sektor energi terbarukan dan hilirisasi ramah lingkungan di kawasan industri Morowali mencatatkan nilai investasi fantastis di kuartal pertama 2026.',
        content: `
          <p>Kawasan industri Morowali terus menarik perhatian dunia. Kali ini, fokus investasi mulai bergeser ke arah energi hijau dan industri hilirisasi yang lebih ramah lingkungan.</p>
          <p>Dinas Penanaman Modal Daerah melaporkan peningkatan realisasi investasi hijau sebesar 25% dibandingkan periode yang sama tahun lalu. Proyek-proyek baru ini mencakup pembangunan pembangkit listrik tenaga surya (PLTS) skala besar dan fasilitas pengolahan limbah industri modern.</p>
          <p>Langkah ini diharapkan dapat meminimalisir dampak lingkungan negatif dari kegiatan pertambangan dan pengolahan nikel, sekaligus membuka ribuan lapangan kerja baru berbasis teknologi ramah lingkungan.</p>
          <p>Pemerintah daerah mengapresiasi komitmen para investor dan berharap sinergi ini terus berjalan selaras dengan target net zero emission nasional.</p>
        `,
        thumbnail: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&h=450&q=80',
        authorId: adminId,
        publishedAt: new Date(),
        categories: { connect: [{ id: categoryMap['ekonomi'] }, { id: categoryMap['sulawesi'] }] },
        tags: { connect: [{ id: tagMap['investasi'] }, { id: tagMap['palu'] }] }
      }
    ];

    for (const art of sampleArticles) {
      await prisma.article.create({
        data: art
      });
    }
    console.log('Sample articles created.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
