import { sql } from "@/lib/db";
import StudentsClient from "./StudentsClient";

async function getStudents() {
  return sql`
    SELECT s.*, u.name AS parent_name, u.email AS parent_email, u.phone AS parent_phone
    FROM students s
    LEFT JOIN users u ON u.id = s.parent_id
    WHERE s.deleted_at IS NULL
    ORDER BY s.name
  `;
}

export default async function StudentsPage() {
  const students = await getStudents();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <StudentsClient initialStudents={students as any} />;
}
