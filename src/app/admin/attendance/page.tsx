import { sql } from "@/lib/db";
import AttendanceClient from "./AttendanceClient";

async function getData() {
  const today = new Date().toISOString().slice(0, 10);

  const lessons = await sql`
    SELECT l.*, c.name AS class_name
    FROM lessons l
    JOIN classes c ON c.id = l.class_id
    WHERE l.lesson_date = ${today} AND l.status = 'scheduled'
    ORDER BY l.start_time
  `;

  const recentLessons = await sql`
    SELECT l.*, c.name AS class_name
    FROM lessons l
    JOIN classes c ON c.id = l.class_id
    WHERE l.lesson_date >= (CURRENT_DATE - INTERVAL '7 days')
      AND l.lesson_date <= CURRENT_DATE
    ORDER BY l.lesson_date DESC, l.start_time DESC
    LIMIT 20
  `;

  return { todayLessons: lessons, recentLessons };
}

export default async function AttendancePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await getData() as any;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return <AttendanceClient {...data} appUrl={appUrl} />;
}
