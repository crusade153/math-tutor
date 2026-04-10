import { sql } from "@/lib/db";
import ScoresClient from "./ScoresClient";

async function getData() {
  const [students, classes] = await Promise.all([
    sql`SELECT id, name, grade FROM students WHERE deleted_at IS NULL AND is_active = true ORDER BY name`,
    sql`SELECT id, name FROM classes WHERE deleted_at IS NULL AND is_active = true ORDER BY name`,
  ]);
  return { students, classes };
}

export default async function ScoresPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await getData() as any;
  return <ScoresClient {...data} />;
}
