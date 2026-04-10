import { sql } from "@/lib/db";
import LessonsClient from "./LessonsClient";

async function getData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const startDate = `${year}-${month}-01`;
  const endDate = `${year}-${month}-31`;

  const [lessons, classes] = await Promise.all([
    sql`
      SELECT l.*, c.name AS class_name
      FROM lessons l
      JOIN classes c ON c.id = l.class_id
      WHERE l.lesson_date BETWEEN ${startDate} AND ${endDate}
      ORDER BY l.lesson_date, l.start_time
    `,
    sql`SELECT id, name FROM classes WHERE deleted_at IS NULL AND is_active = true ORDER BY name`,
  ]);

  return { lessons, classes, year, month };
}

export default async function LessonsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await getData() as any;
  return <LessonsClient {...data} />;
}
