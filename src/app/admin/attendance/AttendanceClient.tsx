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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { QrCode, CalendarPlus } from "lucide-react";

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

interface RoomVisit {
  id: number;
  student_id: number;
  student_name: string;
  grade: string;
  checked_in_at: string | null;
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
  const [roomVisits, setRoomVisits] = useState<RoomVisit[]>([]);

  // 보충 수업 등록 모달
  const [makeupDialogOpen, setMakeupDialogOpen] = useState(false);
  const [makeupForm, setMakeupForm] = useState({
    lesson_date: "",
    start_time: "",
    end_time: "",
    topic: "",
  });
  const [makeupClassId, setMakeupClassId] = useState<number | null>(null);
  const [makeupLoading, setMakeupLoading] = useState(false);

  useEffect(() => {
    if (selectedLessonId) loadAttendance(parseInt(selectedLessonId));
  }, [selectedLessonId]);

  useEffect(() => {
    loadRoomVisits();
  }, []);

  async function loadRoomVisits() {
    const res = await fetch("/api/attendance/room-visits");
    if (res.ok) {
      const json = await res.json();
      setRoomVisits(json.data ?? []);
    }
  }

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

  function openMakeupDialog(a: AttendanceRecord) {
    if (!selectedLesson) return;
    setMakeupClassId(selectedLesson.class_id);
    setMakeupForm({
      lesson_date: "",
      start_time: selectedLesson.start_time.slice(0, 5),
      end_time: selectedLesson.end_time.slice(0, 5),
      topic: selectedLesson.topic ? `[보충] ${selectedLesson.topic}` : "[보충]",
    });
    setMakeupDialogOpen(true);
  }

  async function handleMakeupSave(e: React.FormEvent) {
    e.preventDefault();
    if (!makeupClassId || !makeupForm.lesson_date || !makeupForm.start_time || !makeupForm.end_time) {
      toast.error("날짜와 시간을 입력해주세요.");
      return;
    }
    setMakeupLoading(true);
    const res = await fetch("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_id: makeupClassId,
        lesson_date: makeupForm.lesson_date,
        start_time: makeupForm.start_time,
        end_time: makeupForm.end_time,
        topic: makeupForm.topic || null,
        status: "makeup",
      }),
    });
    if (res.ok) {
      toast.success("보충 수업이 등록되었습니다.");
      setMakeupDialogOpen(false);
    } else {
      const json = await res.json();
      toast.error(json.error ?? "등록 실패");
    }
    setMakeupLoading(false);
  }

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
                          <div className="flex items-center gap-1">
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
                            {a.status === "absent" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-1.5 text-amber-600 hover:bg-amber-50"
                                title="보충 수업 등록"
                                onClick={() => openMakeupDialog(a)}
                              >
                                <CalendarPlus size={15} />
                              </Button>
                            )}
                          </div>
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

      {/* 오늘 QR 입퇴실 현황 */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700">
            오늘 QR 입퇴실 현황
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({roomVisits.length}명)
            </span>
          </h2>
          <Button variant="outline" size="sm" onClick={loadRoomVisits}>
            새로고침
          </Button>
        </div>

        {roomVisits.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-gray-400 text-sm">
              오늘 QR로 입실한 학생이 없습니다.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>학년</TableHead>
                  <TableHead>입실</TableHead>
                  <TableHead>퇴실</TableHead>
                  <TableHead>체류</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomVisits.map((v) => {
                  const inTime = v.checked_in_at ? new Date(v.checked_in_at) : null;
                  const outTime = v.checked_out_at ? new Date(v.checked_out_at) : null;
                  const stayMin =
                    inTime && outTime
                      ? Math.round((outTime.getTime() - inTime.getTime()) / 60000)
                      : null;
                  return (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.student_name}</TableCell>
                      <TableCell className="text-sm text-gray-500">{v.grade}</TableCell>
                      <TableCell className="text-sm">
                        {inTime
                          ? inTime.toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Asia/Seoul",
                            })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {outTime ? (
                          outTime.toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Asia/Seoul",
                          })
                        ) : (
                          <Badge className="bg-green-100 text-green-700 text-xs" variant="outline">
                            공부 중
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-400">
                        {stayMin !== null ? `${stayMin}분` : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* 보충 수업 등록 다이얼로그 */}
      <Dialog open={makeupDialogOpen} onOpenChange={setMakeupDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>보충 수업 등록</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMakeupSave} className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-700">
              결석 학생을 위한 보충 수업을 등록합니다. 상태가 자동으로 <strong>보강</strong>으로 설정됩니다.
            </div>
            <div className="space-y-1.5">
              <Label>보충 날짜 *</Label>
              <Input
                type="date"
                value={makeupForm.lesson_date}
                onChange={(e) => setMakeupForm({ ...makeupForm, lesson_date: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>시작 시간 *</Label>
                <Input
                  type="time"
                  value={makeupForm.start_time}
                  onChange={(e) => setMakeupForm({ ...makeupForm, start_time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>종료 시간 *</Label>
                <Input
                  type="time"
                  value={makeupForm.end_time}
                  onChange={(e) => setMakeupForm({ ...makeupForm, end_time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>수업 주제</Label>
              <Input
                value={makeupForm.topic}
                onChange={(e) => setMakeupForm({ ...makeupForm, topic: e.target.value })}
                placeholder="예: [보충] 이차방정식"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMakeupDialogOpen(false)}>
                취소
              </Button>
              <Button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white"
                disabled={makeupLoading}
              >
                {makeupLoading ? "등록 중..." : "보충 수업 등록"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
