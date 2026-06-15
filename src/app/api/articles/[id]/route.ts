import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  req: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const article = await db.article.findUnique({
      where: { id },
      include: {
        categories: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } }
      }
    });

    if (!article) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil artikel" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentArticle = await db.article.findUnique({ where: { id } });

    if (!currentArticle) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    // Role check: WRITER can only edit their own articles
    if ((session.user as any).role === "WRITER" && currentArticle.authorId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden: Anda hanya dapat mengedit artikel milik sendiri" }, { status: 403 });
    }

    const {
      title,
      excerpt,
      content,
      thumbnail,
      categoryIds,
      tagIds,
      isPublished,
      isFeatured
    } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Judul dan isi artikel harus diisi" }, { status: 400 });
    }

    const slug = slugify(title);
    
    // Check if slug is taken by another article
    const existing = await db.article.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Artikel dengan judul serupa sudah ada" }, { status: 400 });
    }

    // Determine publishedAt date
    let publishedAt = currentArticle.publishedAt;
    if (isPublished && !currentArticle.publishedAt) {
      publishedAt = new Date();
    } else if (!isPublished) {
      publishedAt = null;
    }

    // Reset other featured articles if this one is featured
    if (isFeatured) {
      await db.article.updateMany({
        where: { isFeatured: true, id: { not: id } },
        data: { isFeatured: false }
      });
    }

    // Update the article
    const updatedArticle = await db.article.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt: excerpt || title,
        content,
        thumbnail,
        publishedAt,
        isFeatured: !!isFeatured,
        // Replace existing relationships
        categories: {
          set: [], // Clear relations
          connect: categoryIds ? categoryIds.map((cid: string) => ({ id: cid })) : []
        },
        tags: {
          set: [], // Clear relations
          connect: tagIds ? tagIds.map((tid: string) => ({ id: tid })) : []
        }
      }
    });

    return NextResponse.json(updatedArticle);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui artikel" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentArticle = await db.article.findUnique({ where: { id } });

    if (!currentArticle) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    // Role check: WRITER can only delete their own articles
    if ((session.user as any).role === "WRITER" && currentArticle.authorId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden: Anda hanya dapat menghapus artikel milik sendiri" }, { status: 403 });
    }

    await db.article.delete({ where: { id } });
    return NextResponse.json({ message: "Artikel berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus artikel" }, { status: 500 });
  }
}
