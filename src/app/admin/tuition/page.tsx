import { sql } from "@/lib/db";
import TuitionClient from "./TuitionClient";
import { currentMonth } from "@/lib/utils";

async function getData(month: string) {
  const [tuition, students] = await Promise.all([
    sql`
      SELECT t.*, s.name AS student_name, s.grade
      FROM tuition t
      JOIN students s ON s.id = t.student_id
      WHERE t.month = ${month}
      ORDER BY s.name
    `,
    sql`SELECT id, name, grade FROM students WHERE deleted_at IS NULL AND is_active = true ORDER BY name`,
  ]);
  return { tuition, students };
}

export default async function TuitionPage() {
  const month = currentMonth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await getData(month) as any;
  return <TuitionClient {...data} currentMonth={month} />;
}
