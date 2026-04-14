"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import QRDisplay from "@/components/admin/QRDisplay";
import RoomQRDisplay from "@/components/admin/RoomQRDisplay";
import { formatDate } from "@/lib/utils";
import { QrCode } from "lucide-react";

interface Lesson {
  id: number;
  class_id: number;
  class_name: string;
  lesson_date: string;
  start_time: string;
  end_time: string;
  topic: string | null;
  status: string;
}

interface AttendanceRecord {
  id: number;
  lesson_id: number;
  student_id: number;
  student_name: string;
  grade: string;
  status: string;
  method: string | null;
  checked_at: string | null;
  checked_out_at: string | null;
}

const STATUS_OPTS = [
  { value: "present", label: "출석", color: "bg-green-100 text-green-700" },
  { value: "absent", label: "결석", color: "bg-red-100 text-red-700" },
  { value: "late", label: "지각", color: "bg-amber-100 text-amber-700" },
  { value: "excused", label: "공결", color: "bg-blue-100 text-blue-700" },
];

function statusBadge(status: string) {
  const opt = STATUS_OPTS.find((s) => s.value === status);
  return (
    <Badge className={`text-xs ${opt?.color ?? "bg-gray-100 text-gray-600"}`} variant="outline">
      {opt?.label ?? status}
    </Badge>
  );
}

export default function AttendanceClient({
  todayLessons,
  recentLessons,
  appUrl,
}: {
  todayLessons: Lesson[];
  recentLessons: Lesson[];
  appUrl: string;
}) {
  const allLessons = [...todayLessons, ...recentLessons.filter(
    (r) => !todayLessons.find((t) => t.id === r.id)
  )];

  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    todayLessons[0]?.id.toString() ?? ""
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [showRoomQR, setShowRoomQR] = useState(false);

  useEffect(() => {
    if (selectedLessonId) loadAttendance(parseInt(selectedLessonId));
  }, [selectedLessonId]);

  async function loadAttendance(lessonId: number) {
    setLoadingAttendance(true);
    const res = await fetch(`/api/attendance?lessonId=${lessonId}`);
    if (res.ok) {
      const json = await res.json();
      setAttendance(json.data ?? []);
    }
    setLoadingAttendance(false);
  }

  async function updateStatus(studentId: number, status: string) {
    if (!selectedLessonId) return;
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lesson_id: parseInt(selectedLessonId),
        student_id: studentId,
        status,
      }),
    });

    if (res.ok) {
      toast.success("출결이 업데이트되었습니다.");
      await loadAttendance(parseInt(selectedLessonId));
    } else {
      toast.error("업데이트 실패");
    }
  }

  const selectedLesson = allLessons.find(
    (l) => l.id.toString() === selectedLessonId
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">출결 관리</h1>
      </div>

      {/* 방 QR 코드 섹션 */}
      <div className="mb-5 no-print">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRoomQR((v) => !v)}
          className="flex items-center gap-1.5"
        >
          <QrCode size={15} />
          방 QR 코드 {showRoomQR ? "숨기기" : "보기"}
        </Button>
        {showRoomQR && (
          <div className="mt-3 p-4 bg-gray-50 rounded-xl border">
            <p className="text-sm text-gray-500 mb-1">
              공부방에 붙여두는 <strong>입실/퇴실 QR</strong>입니다.
              학생이 폰으로 스캔 후 4자리 PIN을 입력하면 출석이 자동 기록됩니다.
            </p>
            <RoomQRDisplay appUrl={appUrl} />
          </div>
        )}
      </div>

      <div className="mb-4">
        <Select value={selectedLessonId} onValueChange={(v) => v !== null && setSelectedLessonId(v)}>
          <SelectTrigger className="w-full md:w-96">
            <SelectValue placeholder="수업을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {allLessons.map((l) => (
              <SelectItem key={l.id} value={l.id.toString()}>
                {formatDate(l.lesson_date)} {l.start_time.slice(0, 5)} — {l.class_name}
                {l.topic ? ` (${l.topic})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedLesson && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR 코드 */}
          <div>
            <h2 className="font-semibold mb-3 text-gray-700">QR 출석 코드</h2>
            <QRDisplay
              lessonId={selectedLesson.id}
              appUrl={appUrl}
            />
          </div>

          {/* 출결 현황 */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-700">
                출결 현황{" "}
                <span className="text-sm font-normal text-gray-400">
                  ({attendance.length}명)
                </span>
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadAttendance(parseInt(selectedLessonId))}
              >
                새로고침
              </Button>
            </div>

            {loadingAttendance ? (
              <div className="text-center py-8 text-gray-400">로딩 중...</div>
            ) : attendance.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-400">
                  아직 출결 기록이 없습니다.
                  <br />
                  QR을 생성하거나 수동으로 출결을 입력하세요.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>학생</TableHead>
                      <TableHead>학년</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>방법</TableHead>
                      <TableHead>입실</TableHead>
                      <TableHead>퇴실</TableHead>
                      <TableHead>변경</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((a) => (
                      <TableRow key={a.student_id}>
                        <TableCell className="font-medium">{a.student_name}</TableCell>
                        <TableCell className="text-sm text-gray-500">{a.grade}</TableCell>
                        <TableCell>{statusBadge(a.status)}</TableCell>
                        <TableCell className="text-xs text-gray-400">
                          {a.method === "qr" ? "QR" : a.method === "pin" ? "PIN" : a.method === "manual" ? "수동" : "-"}
                        </TableCell>
                        <TableCell className="text-xs text-gray-400">
                          {a.checked_at
                            ? new Date(a.checked_at).toLocaleTimeString("ko-KR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "Asia/Seoul",
                              })
                            : "-"}
                        </TableCell>
                        <TableCell className="text-xs text-gray-400">
                          {a.checked_out_at
                            ? new Date(a.checked_out_at).toLocaleTimeString("ko-KR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "Asia/Seoul",
                              })
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={a.status}
                            onValueChange={(v) => v !== null && updateStatus(a.student_id, v)}
                          >
                            <SelectTrigger className="h-7 w-20 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        </div>
      )}

      {allLessons.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-500">
              최근 수업이 없습니다
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-400">
            수업 일정을 먼저 등록해주세요.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
