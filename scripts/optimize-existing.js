const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function optimizeUploads() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

  if (!fs.existsSync(uploadsDir)) {
    console.log('Folder uploads tidak ditemukan:', uploadsDir);
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`Menemukan ${files.length} file di ${uploadsDir}...`);

  let totalSavedBytes = 0;
  let optimizedCount = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);

    if (['.jpg', '.jpeg', '.png', '.jfif'].includes(ext)) {
      try {
        const originalSize = stats.size;
        const originalBuffer = fs.readFileSync(filePath);

        let pipeline = sharp(originalBuffer).rotate().resize({
          width: 1600,
          height: 1200,
          fit: 'inside',
          withoutEnlargement: true,
        });

        let compressedBuffer;
        if (ext === '.png') {
          compressedBuffer = await pipeline.png({ quality: 80, compressionLevel: 9 }).toBuffer();
        } else {
          compressedBuffer = await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
        }

        // Only overwrite if new buffer is smaller
        if (compressedBuffer.length < originalSize) {
          fs.writeFileSync(filePath, compressedBuffer);
          const savedBytes = originalSize - compressedBuffer.length;
          totalSavedBytes += savedBytes;
          optimizedCount++;
          console.log(
            `✓ ${file}: ${(originalSize / 1024).toFixed(1)} KB -> ${(compressedBuffer.length / 1024).toFixed(1)} KB (Hemat ${(savedBytes / 1024).toFixed(1)} KB)`
          );
        } else {
          console.log(`- ${file}: Sudah optimal (${(originalSize / 1024).toFixed(1)} KB)`);
        }
      } catch (err) {
        console.error(`✗ Gagal mengoptimasi ${file}:`, err.message);
      }
    }
  }

  console.log('---');
  console.log(
    `Selesai! Berhasil mengoptimasi ${optimizedCount} file. Total ruang dihemat: ${(totalSavedBytes / 1024 / 1024).toFixed(2)} MB.`
  );
}

optimizeUploads();
