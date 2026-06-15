import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const tagSlug = searchParams.get("tag");
    const query = searchParams.get("q");
    const status = searchParams.get("status"); // 'published', 'draft', or 'all'
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by category slug
    if (categorySlug) {
      where.categories = {
        some: { slug: categorySlug }
      };
    }

    // Filter by tag slug
    if (tagSlug) {
      where.tags = {
        some: { slug: tagSlug }
      };
    }

    // Filter by status
    if (status === "published") {
      where.publishedAt = { not: null };
    } else if (status === "draft") {
      where.publishedAt = null;
    }

    // Filter by search query
    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ];
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          author: {
            select: { name: true, avatar: true }
          },
          categories: {
            select: { id: true, name: true, slug: true }
          },
          tags: {
            select: { id: true, name: true, slug: true }
          }
        }
      }),
      db.article.count({ where })
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil artikel" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    
    // Check if slug is unique
    const existing = await db.article.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Artikel dengan judul serupa sudah ada" }, { status: 400 });
    }

    // Reset other featured articles if this one is featured
    if (isFeatured) {
      await db.article.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false }
      });
    }

    const article = await db.article.create({
      data: {
        title,
        slug,
        excerpt: excerpt || title,
        content,
        thumbnail,
        authorId: (session.user as any).id,
        publishedAt: isPublished ? new Date() : null,
        isFeatured: !!isFeatured,
        categories: categoryIds ? {
          connect: categoryIds.map((id: string) => ({ id }))
        } : undefined,
        tags: tagIds ? {
          connect: tagIds.map((id: string) => ({ id }))
        } : undefined
      }
    });

    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat artikel" }, { status: 500 });
  }
}
