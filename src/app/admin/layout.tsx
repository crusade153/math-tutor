import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import EnableNotificationsPrompt from "@/components/notifications/EnableNotificationsPrompt";
import UnreadNoticesToast from "@/components/notifications/UnreadNoticesToast";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/parent/dashboard");

  return (
    <>
      <AdminLayoutClient>{children}</AdminLayoutClient>
      <EnableNotificationsPrompt />
      <UnreadNoticesToast noticesUrl="/admin/notices" />
    </>
  );
}
