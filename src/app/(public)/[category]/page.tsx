import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export const revalidate = 0;

interface CategoryCatchProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryCatchPage({ params }: CategoryCatchProps) {
  const { category: slug } = await params;

  // Check if it's a category
  const cat = await db.category.findUnique({
    where: { slug },
  });

  if (cat) {
    redirect(`/kategori/${slug}`);
  }

  // Check if it's a tag
  const tag = await db.tag.findUnique({
    where: { slug },
  });

  if (tag) {
    redirect(`/tag/${slug}`);
  }

  // Fallback to category router
  redirect(`/kategori/${slug}`);
}
