import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import fs from "fs";
import path from "path";

// Configure Cloudinary if credentials exist
const hasCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/jfif",
  "image/png",
  "image/x-png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".jfif", ".avif"];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    // 1. Validasi Ukuran File (Maksimal 5MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal 5MB diizinkan." },
        { status: 400 }
      );
    }

    // 2. Validasi Ekstensi File
    const originalExt = path.extname(file.name || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(originalExt)) {
      return NextResponse.json(
        { error: "Ekstensi file tidak valid. Hanya gambar (.jpg, .jpeg, .png, .webp, .gif) yang diizinkan." },
        { status: 400 }
      );
    }

    // 3. Validasi Tipe MIME (jika disediakan oleh browser)
    const fileType = (file.type || "").toLowerCase().trim();
    if (fileType && fileType !== "application/octet-stream" && !ALLOWED_MIME_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Hanya gambar (JPEG, PNG, WebP, GIF) yang diizinkan." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Optimasi dan Kompresi Gambar Otomatis dengan Sharp
    let processedBuffer: Buffer = buffer;
    let finalExt = originalExt || ".jpg";

    if (originalExt !== ".gif") {
      try {
        processedBuffer = await sharp(buffer)
          .rotate() // Menyesuaikan orientasi foto kamera secara otomatis
          .resize({
            width: 1600,
            height: 1200,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 80, effort: 4 })
          .toBuffer();
        finalExt = ".webp";
      } catch (sharpError) {
        console.warn("Optimasi sharp gagal, menggunakan buffer asli:", sharpError);
        processedBuffer = buffer;
        finalExt = originalExt || ".jpg";
      }
    }

    // Cek konfigurasi Cloudinary
    const isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim() &&
      process.env.CLOUDINARY_CLOUD_NAME !== "your-cloudinary-cloud-name"
    );

    if (isCloudinaryConfigured) {
      try {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "terbitkata",
              resource_type: "image",
              format: finalExt === ".webp" ? "webp" : undefined,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(processedBuffer);
        });

        return NextResponse.json({ url: uploadResult.secure_url });
      } catch (cloudError) {
        console.warn("Upload Cloudinary gagal, beralih ke penyimpanan lokal:", cloudError);
        // Fallback otomatis ke penyimpanan lokal di bawah
      }
    }

    // Local Storage
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Pastikan direktori ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${finalExt}`;
    const filePath = path.join(uploadDir, cleanFileName);

    fs.writeFileSync(filePath, processedBuffer);

    return NextResponse.json({ url: `/uploads/${cleanFileName}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal mengunggah gambar" }, { status: 500 });
  }
}
