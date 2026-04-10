import { sql } from "@/lib/db";
import ClassesClient from "./ClassesClient";

async function getClasses() {
  return sql`
    SELECT c.*,
           COUNT(cs.student_id)::int AS student_count
    FROM classes c
    LEFT JOIN class_students cs ON cs.class_id = c.id
    WHERE c.deleted_at IS NULL
    GROUP BY c.id
    ORDER BY c.name
  `;
}

export default async function ClassesPage() {
  const classes = await getClasses();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ClassesClient initialClasses={classes as any} />;
}
