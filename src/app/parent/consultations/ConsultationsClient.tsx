"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Slot {
  id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
}

interface Consultation {
  id: number;
  slot_id: number;
  student_name: string | null;
  type: string;
  topic: string | null;
  status: string;
  parent_memo: string | null;
  slot_date: string;
  start_time: string;
  end_time: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  requested: { label: "신청", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "확정", color: "bg-blue-100 text-blue-700" },
  completed: { label: "완료", color: "bg-green-100 text-green-700" },
  cancelled: { label: "취소", color: "bg-gray-100 text-gray-500" },
};

const TYPE_MAP: Record<string, string> = {
  in_person: "대면",
  phone: "전화",
  video: "화상",
};

export default function ConsultationsClient({
  consultations: initialConsultations,
  availableSlots,
  students,
}: {
  consultations: Consultation[];
  availableSlots: Slot[];
  students: { id: number; name: string }[];
}) {
  const [consultations, setConsultations] = useState<Consultation[]>(initialConsultations);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [slotId, setSlotId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [type, setType] = useState("in_person");
  const [topic, setTopic] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!slotId) { toast.error("시간대를 선택해주세요."); return; }
    setLoading(true);

    const res = await fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slot_id: parseInt(slotId),
        student_id: studentId ? parseInt(studentId) : null,
        type,
        topic: topic || null,
        parent_memo: memo || null,
      }),
    });

    if (res.ok) {
      toast.success("면담 신청이 완료되었습니다.");
      // 목록 새로고침
      const listRes = await fetch("/api/consultations");
      if (listRes.ok) {
        const json = await listRes.json();
        setConsultations(json.data ?? []);
      }
      setDialogOpen(false);
      setSlotId(""); setStudentId(""); setTopic(""); setMemo("");
    } else {
      const json = await res.json();
      toast.error(json.error ?? "신청 실패");
    }
    setLoading(false);
  }

  async function handleCancel(id: number) {
    if (!confirm("면담 신청을 취소하시겠습니까?")) return;
    const res = await fetch(`/api/consultations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    if (res.ok) {
      toast.success("취소되었습니다.");
      setConsultations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "cancelled" } : c))
      );
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">면담 예약</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          size="sm"
          onClick={() => setDialogOpen(true)}
          disabled={availableSlots.length === 0}
        >
          <Plus size={14} className="mr-1" />
          면담 신청
        </Button>
      </div>

      {availableSlots.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">
          현재 예약 가능한 면담 시간대가 없습니다.
        </p>
      )}

      {consultations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-400 text-sm">
            면담 예약 내역이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {consultations.map((c) => {
            const st = STATUS_MAP[c.status] ?? STATUS_MAP.requested;
            return (
              <Card key={c.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>
                      {formatDate(c.slot_date)}{" "}
                      {String(c.start_time).slice(0, 5)} ~{" "}
                      {String(c.end_time).slice(0, 5)}
                    </span>
                    <Badge className={`text-xs ${st.color}`} variant="outline">
                      {st.label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p className="text-gray-600">
                    유형: {TYPE_MAP[c.type] ?? c.type}
                    {c.student_name && ` · ${c.student_name}`}
                  </p>
                  {c.topic && <p className="text-gray-500">주제: {c.topic}</p>}
                  {c.parent_memo && (
                    <p className="text-gray-400 text-xs">{c.parent_memo}</p>
                  )}
                  {c.status === "requested" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 p-0 h-auto mt-1"
                      onClick={() => handleCancel(c.id)}
                    >
                      취소하기
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>면담 신청</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBook} className="space-y-4">
            <div className="space-y-1.5">
              <Label>면담 시간 선택 *</Label>
              <Select value={slotId} onValueChange={(v) => v !== null && setSlotId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="시간대 선택" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {formatDate(s.slot_date)} {String(s.start_time).slice(0, 5)}~{String(s.end_time).slice(0, 5)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>자녀</Label>
              <Select value={studentId} onValueChange={(v) => v !== null && setStudentId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="자녀 선택 (선택)" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>면담 유형</Label>
              <Select value={type} onValueChange={(v) => v !== null && setType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_person">대면</SelectItem>
                  <SelectItem value="phone">전화</SelectItem>
                  <SelectItem value="video">화상</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>면담 주제</Label>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="예: 수업 진도, 성적 관련"
              />
            </div>
            <div className="space-y-1.5">
              <Label>메모</Label>
              <Textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="선생님께 전달할 내용"
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>취소</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "신청 중..." : "신청"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
