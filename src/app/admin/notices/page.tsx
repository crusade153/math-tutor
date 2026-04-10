import { sql } from "@/lib/db";
import NoticesClient from "./NoticesClient";

export default async function AdminNoticesPage() {
  const notices = await sql`SELECT * FROM notices ORDER BY created_at DESC`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <NoticesClient notices={notices as any} />;
}
