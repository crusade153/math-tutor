import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

export default async function ChangePasswordPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <ChangePasswordForm />;
}
