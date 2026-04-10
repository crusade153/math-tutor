import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import ConsultationsClient from "./ConsultationsClient";

export default async function ParentConsultationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [consultations, availableSlots, students] = await Promise.all([
    sql`
      SELECT c.*, s.name AS student_name, cs.slot_date, cs.start_time, cs.end_time
      FROM consultations c
      LEFT JOIN students s ON s.id = c.student_id
      JOIN consultation_slots cs ON cs.id = c.slot_id
      WHERE c.parent_id = ${session.userId}
      ORDER BY cs.slot_date DESC
    `,
    sql`
      SELECT * FROM consultation_slots
      WHERE is_available = true AND slot_date >= CURRENT_DATE
      ORDER BY slot_date, start_time
    `,
    sql`
      SELECT id, name FROM students
      WHERE parent_id = ${session.userId} AND deleted_at IS NULL
    `,
  ]);

  return (
    <ConsultationsClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      consultations={consultations as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      availableSlots={availableSlots as any}
      students={students as { id: number; name: string }[]}
    />
  );
}
