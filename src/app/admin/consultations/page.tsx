import { sql } from "@/lib/db";
import AdminConsultationsClient from "./AdminConsultationsClient";

async function getData() {
  const [consultations, slots, students] = await Promise.all([
    sql`
      SELECT c.*, u.name AS parent_name, u.phone AS parent_phone,
             s.name AS student_name,
             cs.slot_date, cs.start_time, cs.end_time
      FROM consultations c
      JOIN users u ON u.id = c.parent_id
      LEFT JOIN students s ON s.id = c.student_id
      JOIN consultation_slots cs ON cs.id = c.slot_id
      ORDER BY cs.slot_date DESC, cs.start_time DESC
    `,
    sql`
      SELECT * FROM consultation_slots
      WHERE slot_date >= CURRENT_DATE
      ORDER BY slot_date, start_time
    `,
    sql`SELECT id, name FROM students WHERE deleted_at IS NULL AND is_active = true ORDER BY name`,
  ]);
  return { consultations, slots, students };
}

export default async function AdminConsultationsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await getData() as any;
  return <AdminConsultationsClient {...data} />;
}
