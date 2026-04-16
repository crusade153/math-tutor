import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import AbsenceClient from "./AbsenceClient";

async function getData(parentId: number) {
  const [students, requests] = await Promise.all([
    sql`
      SELECT id, name, grade
      FROM students
      WHERE parent_id = ${parentId} AND deleted_at IS NULL AND is_active = TRUE
      ORDER BY name
    `,
    sql`
      SELECT ar.*, s.name AS student_name
      FROM absence_requests ar
      JOIN students s ON s.id = ar.student_id
      WHERE s.parent_id = ${parentId}
      ORDER BY ar.absence_date DESC, ar.created_at DESC
      LIMIT 30
    `,
  ]);
  return { students, requests };
}

export default async function AbsencePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "parent") redirect("/admin/dashboard");

  const data = await getData(session.userId) as {
    students: Array<{ id: number; name: string; grade: string }>;
    requests: Array<{
      id: number;
      student_id: number;
      student_name: string;
      absence_date: string;
      reason: string | null;
      status: string;
      admin_note: string | null;
      created_at: string;
    }>;
  };

  return <AbsenceClient {...data} />;
}
