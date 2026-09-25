import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const createArticleSchema = z.object({
  title: z.string().trim().min(3, "Judul artikel minimal 3 karakter").max(200, "Judul artikel maksimal 200 karakter"),
  excerpt: z.string().trim().max(500, "Ringkasan maksimal 500 karakter").optional().nullable(),
  content: z.string().trim().min(10, "Isi artikel minimal 10 karakter"),
  thumbnail: z.string().trim().optional().nullable(),
  thumbnailCaption: z.string().trim().max(300, "Keterangan foto maksimal 300 karakter").optional().nullable(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

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

    const body = await req.json();
    const parsed = createArticleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data artikel tidak valid" },
        { status: 400 }
      );
    }

    const {
      title,
      excerpt,
      content,
      thumbnail,
      thumbnailCaption,
      categoryIds,
      tagIds,
      isPublished,
      isFeatured
    } = parsed.data;

    const slug = slugify(title);
    
    // Check if slug is unique
    const existing = await db.article.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Artikel dengan judul serupa sudah ada" }, { status: 400 });
    }



    const article = await db.article.create({
      data: {
        title,
        slug,
        excerpt: excerpt || title,
        content,
        thumbnail,
        thumbnailCaption,
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
