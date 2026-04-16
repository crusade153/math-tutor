import { sql } from "@/lib/db";
import GalleryClient from "./GalleryClient";

async function getData() {
  const images = await sql`
    SELECT id, url, caption, display_order, is_active
    FROM gallery_images
    WHERE is_active = TRUE
    ORDER BY display_order ASC, created_at ASC
  `;
  return { images };
}

export default async function GalleryPage() {
  const data = await getData() as { images: Array<{ id: number; url: string; caption: string | null; display_order: number; is_active: boolean }> };
  return <GalleryClient images={data.images} />;
}
