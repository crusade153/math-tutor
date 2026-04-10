import { sql } from "@/lib/db";
import InquiriesClient from "./InquiriesClient";

export default async function InquiriesPage() {
  const inquiries = await sql`SELECT * FROM inquiries ORDER BY created_at DESC`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <InquiriesClient inquiries={inquiries as any} />;
}
