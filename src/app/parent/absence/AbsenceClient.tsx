"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { CalendarX, Trash2, Plus, BookOpen } from "lucide-react";

interface Student {
  id: number;
  name: string;
  grade: string;
}

interface UpcomingLesson {
  id: number;
  lesson_date: string;
  start_time: string;
  end_time: string;
  topic: string | null;
  class_name: string;
}

interface AbsenceRequest {
  id: number;
  student_id: number;
  student_name: string;
  absence_date: string;
  lesson_id: number | null;
  lesson_date: string;
  lesson_start_time: string | null;
  lesson_end_time: string | null;
  lesson_class_name: string | null;
  reason: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: "대기중",  color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "공결처리됨", color: "bg-green-100 text-green-700" },
  rejected:  { label: "거절됨",  color: "bg-red-100 text-red-700" },
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatLessonDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const day = WEEKDAYS[d.getDay()];
  return `${mm}/${dd}(${day})`;
}

function formatFullDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export default function AbsenceClient({
  students,
  lessonsByStudent,
  requests: initialRequests,
}: {
  students: Student[];
  lessonsByStudent: Record<string, UpcomingLesson[]>;
  requests: AbsenceRequest[];
}) {
  const [requests, setRequests] = useState<AbsenceRequest[]>(initialRequests);
  const [studentId, setStudentId] = useState<string>(students[0]?.id.toString() ?? "");
  const [lessonId, setLessonId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 선택된 학생의 예정 수업 목록
  const upcomingLessons: UpcomingLesson[] = useMemo(
    () => lessonsByStudent[studentId] ?? [],
    [lessonsByStudent, studentId]
  );

  // 학생 변경 시 수업 선택 초기화
  function handleStudentChange(v: string) {
    setStudentId(v);
    setLessonId("");
  }

  const selectedLesson = upcomingLessons.find((l) => l.id.toString() === lessonId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId || !lessonId) {
      toast.error("학생과 결석할 수업을 선택해주세요.");
      return;
    }
    if (!selectedLesson) return;

    setSubmitting(true);
    const res = await fetch("/api/absence-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: parseInt(studentId),
        lesson_id: parseInt(lessonId),
        absence_date: selectedLesson.lesson_date,
        reason: reason.trim() || null,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      const student = students.find((s) => s.id === parseInt(studentId));
      setRequests((prev) => [
        {
          ...json.data,
          student_name: student?.name ?? "",
          lesson_id: parseInt(lessonId),
          lesson_date: selectedLesson.lesson_date,
          lesson_start_time: selectedLesson.start_time,
          lesson_end_time: selectedLesson.end_time,
          lesson_class_name: selectedLesson.class_name,
          absence_date: selectedLesson.lesson_date,
        },
        ...prev,
      ]);
      setLessonId("");
      setReason("");
      toast.success("결석 신고가 접수되었습니다.");
    } else {
      const json = await res.json();
      toast.error(json.error ?? "신고 실패");
    }
    setSubmitting(false);
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/absence-requests/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success("신고가 취소되었습니다.");
    } else {
      toast.error("취소할 수 없습니다.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarX size={22} className="text-rose-500" />
          결석 사전 신고
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          결석할 수업을 선택하면 선생님이 확인 후 공결 처리합니다.
        </p>
      </div>

      {/* 신고 폼 */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm">
            <Plus size={15} />
            결석 신고하기
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* 학생 선택 */}
            <div className="space-y-1.5">
              <Label>학생 *</Label>
              <Select value={studentId} onValueChange={(v) => v !== null && handleStudentChange(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="학생 선택" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name} ({s.grade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 수업 선택 */}
            <div className="space-y-1.5">
              <Label>결석할 수업 *</Label>
              {upcomingLessons.length === 0 ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 text-sm text-gray-400 border">
                  <BookOpen size={15} />
                  예정된 수업이 없습니다.
                </div>
              ) : (
                <Select value={lessonId} onValueChange={(v) => v !== null && setLessonId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="수업 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {upcomingLessons.map((l) => (
                      <SelectItem key={l.id} value={l.id.toString()}>
                        {formatLessonDate(l.lesson_date)} &nbsp;
                        {l.start_time}~{l.end_time} &nbsp;
                        {l.class_name}
                        {l.topic ? ` · ${l.topic}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* 선택된 수업 미리보기 */}
              {selectedLesson && (
                <div className="mt-1.5 p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 space-y-0.5">
                  <p className="font-semibold">{selectedLesson.class_name}</p>
                  <p>{formatFullDate(selectedLesson.lesson_date)} &nbsp; {selectedLesson.start_time} ~ {selectedLesson.end_time}</p>
                  {selectedLesson.topic && <p className="text-indigo-500">주제: {selectedLesson.topic}</p>}
                </div>
              )}
            </div>

            {/* 사유 */}
            <div className="space-y-1.5">
              <Label>사유 (선택)</Label>
              <Textarea
                placeholder="결석 사유를 입력해주세요 (예: 병원 방문, 학교 행사 등)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={300}
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || !lessonId || upcomingLessons.length === 0}
              className="w-full"
            >
              {submitting ? "신고 중..." : "결석 신고"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 신고 내역 */}
      <div>
        <h2 className="font-semibold mb-3 text-sm">신고 내역</h2>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-400 text-sm">
              아직 신고 내역이 없습니다.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const statusInfo = STATUS_MAP[req.status] ?? STATUS_MAP.pending;
              // 수업 정보가 있으면 그걸 우선, 없으면 absence_date 사용
              const displayDate = req.lesson_date || req.absence_date;
              return (
                <Card key={req.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{req.student_name}</span>
                          <Badge className={`text-xs ${statusInfo.color}`} variant="outline">
                            {statusInfo.label}
                          </Badge>
                        </div>

                        {/* 수업 정보 */}
                        {req.lesson_class_name ? (
                          <p className="text-sm font-medium text-gray-800">{req.lesson_class_name}</p>
                        ) : null}
                        <p className="text-sm text-gray-600">
                          {formatFullDate(displayDate)}
                          {req.lesson_start_time && req.lesson_end_time
                            ? ` · ${req.lesson_start_time}~${req.lesson_end_time}`
                            : ""}
                        </p>

                        {req.reason && (
                          <p className="text-xs text-gray-500 mt-1">사유: {req.reason}</p>
                        )}
                        {req.admin_note && (
                          <p className="text-xs text-indigo-600 mt-1">
                            선생님 메모: {req.admin_note}
                          </p>
                        )}
                      </div>
                      {req.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                          onClick={() => handleDelete(req.id)}
                          title="신고 취소"
                        >
                          <Trash2 size={15} />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
