"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { CalendarX, Trash2, Plus } from "lucide-react";

interface Student {
  id: number;
  name: string;
  grade: string;
}

interface AbsenceRequest {
  id: number;
  student_id: number;
  student_name: string;
  absence_date: string;
  reason: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "대기중", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "확인됨", color: "bg-green-100 text-green-700" },
  rejected: { label: "거절됨", color: "bg-red-100 text-red-700" },
};

export default function AbsenceClient({
  students,
  requests: initialRequests,
}: {
  students: Student[];
  requests: AbsenceRequest[];
}) {
  const [requests, setRequests] = useState<AbsenceRequest[]>(initialRequests);
  const [studentId, setStudentId] = useState<string>(students[0]?.id.toString() ?? "");
  const [absenceDate, setAbsenceDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 오늘 이후 날짜만 선택 가능
  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId || !absenceDate) {
      toast.error("학생과 날짜를 선택해주세요.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/absence-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: parseInt(studentId),
        absence_date: absenceDate,
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
        },
        ...prev,
      ]);
      setAbsenceDate("");
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
          결석 예정일을 미리 신고하면 선생님이 확인 후 공결 처리합니다.
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
            <div className="space-y-1.5">
              <Label>학생 *</Label>
              <Select value={studentId} onValueChange={(v) => v !== null && setStudentId(v)}>
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

            <div className="space-y-1.5">
              <Label>결석 날짜 *</Label>
              <Input
                type="date"
                min={today}
                value={absenceDate}
                onChange={(e) => setAbsenceDate(e.target.value)}
                required
              />
            </div>

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

            <Button type="submit" disabled={submitting} className="w-full">
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
                        <p className="text-sm text-gray-700">
                          {new Date(req.absence_date + "T00:00:00").toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            weekday: "short",
                          })}
                        </p>
                        {req.reason && (
                          <p className="text-xs text-gray-500 mt-1">{req.reason}</p>
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
