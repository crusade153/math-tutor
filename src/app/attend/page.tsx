import PinAttendanceClient from "./PinAttendanceClient";

export default async function AttendPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const type = params.type === "exit" ? "exit" : "entry";
  return <PinAttendanceClient type={type} />;
}
