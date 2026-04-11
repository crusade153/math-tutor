import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import ParentsClient from "./ParentsClient";

export default async function AdminParentsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const rows = await sql`
    SELECT u.id, u.username, u.name, u.phone, u.is_active, u.created_at,
           json_agg(
             json_build_object('id', s.id, 'name', s.name, 'grade', s.grade)
             ORDER BY s.name
           ) FILTER (WHERE s.id IS NOT NULL AND s.deleted_at IS NULL) AS students
    FROM users u
    LEFT JOIN students s ON s.parent_id = u.id
    WHERE u.role = 'parent' AND u.deleted_at IS NULL
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `;

  return <ParentsClient initialParents={rows as Parameters<typeof ParentsClient>[0]["initialParents"]} />;
}
