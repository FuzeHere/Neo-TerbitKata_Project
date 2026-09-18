import { NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

async function getFallbackImageBuffer(): Promise<Buffer> {
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  if (fs.existsSync(logoPath)) {
    try {
      const resizedLogo = await sharp(logoPath)
        .resize({ width: 440, height: 180, fit: "inside" })
        .toBuffer();

      return await sharp({
        create: {
          width: 1200,
          height: 630,
          channels: 3,
          background: { r: 15, g: 23, b: 42 }, // Dark slate
        },
      })
        .composite([{ input: resizedLogo, gravity: "center" }])
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
    } catch (e) {
      console.warn("Failed to generate branded fallback:", e);
    }
  }

  return await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: { r: 37, g: 99, b: 235 }, // Blue
    },
  })
    .jpeg({ quality: 80 })
    .toBuffer();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get("url") || searchParams.get("src");

    if (!target || !target.trim()) {
      const fallback = await getFallbackImageBuffer();
      return new NextResponse(new Uint8Array(fallback), {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Length": fallback.length.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    let inputBuffer: Buffer | null = null;
    const cleanTarget = target.trim();

    // 1. Check if it's a local file in /uploads
    if (cleanTarget.startsWith("/uploads/") || cleanTarget.includes("/uploads/")) {
      const filename = path.basename(cleanTarget.split("?")[0]);
      const localFilePath = path.join(process.cwd(), "public", "uploads", filename);
      if (fs.existsSync(localFilePath)) {
        inputBuffer = fs.readFileSync(localFilePath);
      }
    }

    // 2. If not local or not found, try fetching if it's an HTTP URL
    if (!inputBuffer && (cleanTarget.startsWith("http://") || cleanTarget.startsWith("https://"))) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(cleanTarget, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; TerbitKataOG/1.0)",
          },
        });
        clearTimeout(timeout);

        if (res.ok) {
          const ab = await res.arrayBuffer();
          inputBuffer = Buffer.from(ab);
        }
      } catch (fetchErr) {
        console.warn("OG image fetch failed for:", cleanTarget, fetchErr);
      }
    }

    // 3. If still no buffer, return fallback
    if (!inputBuffer) {
      const fallback = await getFallbackImageBuffer();
      return new NextResponse(new Uint8Array(fallback), {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Length": fallback.length.toString(),
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // 4. Transform to optimal 1200x630 JPEG under 300KB
    const optimizedJpeg = await sharp(inputBuffer)
      .rotate() // auto-orient
      .resize(1200, 630, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    return new NextResponse(new Uint8Array(optimizedJpeg), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": optimizedJpeg.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error generating OG image:", error);
    const fallback = await getFallbackImageBuffer();
    return new NextResponse(new Uint8Array(fallback), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": fallback.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}
