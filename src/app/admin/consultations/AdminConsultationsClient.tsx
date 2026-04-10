"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Consultation {
  id: number;
  parent_name: string;
  parent_phone: string;
  student_name: string | null;
  type: string;
  topic: string | null;
  status: string;
  parent_memo: string | null;
  teacher_memo: string | null;
  slot_date: string;
  start_time: string;
  end_time: string;
}

interface Slot {
  id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const STATUS_MAP: Record<string, { label: string; color: string; next?: string; nextLabel?: string }> = {
  requested: { label: "신청", color: "bg-amber-100 text-amber-700", next: "confirmed", nextLabel: "확정" },
  confirmed: { label: "확정", color: "bg-blue-100 text-blue-700", next: "completed", nextLabel: "완료" },
  completed: { label: "완료", color: "bg-green-100 text-green-700" },
  cancelled: { label: "취소", color: "bg-gray-100 text-gray-500" },
};

const TYPE_MAP: Record<string, string> = { in_person: "대면", phone: "전화", video: "화상" };

export default function AdminConsultationsClient({
  consultations: initialConsultations,
  slots: initialSlots,
}: {
  consultations: Consultation[];
  slots: Slot[];
  students: { id: number; name: string }[];
}) {
  const [consultations, setConsultations] = useState<Consultation[]>(initialConsultations);
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({ slot_date: "", start_time: "", end_time: "" });
  const [memoDialogId, setMemoDialogId] = useState<number | null>(null);
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/consultations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("상태가 변경되었습니다.");
      setConsultations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    }
  }

  async function saveMemo() {
    if (!memoDialogId) return;
    setLoading(true);
    const res = await fetch(`/api/consultations/${memoDialogId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacher_memo: memo }),
    });
    if (res.ok) {
      toast.success("메모가 저장되었습니다.");
      setConsultations((prev) =>
        prev.map((c) => (c.id === memoDialogId ? { ...c, teacher_memo: memo } : c))
      );
      setMemoDialogId(null);
    }
    setLoading(false);
  }

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!slotForm.slot_date || !slotForm.start_time || !slotForm.end_time) {
      toast.error("날짜와 시간을 입력해주세요."); return;
    }
    const res = await fetch("/api/consultations/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slotForm),
    });
    if (res.ok) {
      const json = await res.json();
      toast.success("시간대가 추가되었습니다.");
      setSlots((prev) => [...prev, json.data]);
      setSlotDialogOpen(false);
      setSlotForm({ slot_date: "", start_time: "", end_time: "" });
    }
  }

  const pendingConsultations = consultations.filter((c) => c.status === "requested");
  const activeConsultation = memoDialogId ? consultations.find((c) => c.id === memoDialogId) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">면담 관리</h1>

      <Tabs defaultValue="consultations">
        <TabsList className="mb-4">
          <TabsTrigger value="consultations">
            면담 신청
            {pendingConsultations.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0">{pendingConsultations.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="slots">시간대 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="consultations" className="space-y-3">
          {consultations.length === 0 ? (
            <p className="text-center text-gray-400 py-8">면담 신청이 없습니다.</p>
          ) : (
            consultations.map((c) => {
              const st = STATUS_MAP[c.status] ?? STATUS_MAP.requested;
              return (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${st.color}`} variant="outline">{st.label}</Badge>
                          <span className="font-medium text-sm">{c.parent_name}</span>
                          <span className="text-xs text-gray-400">{c.parent_phone}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatDate(c.slot_date)} {String(c.start_time).slice(0, 5)}~{String(c.end_time).slice(0, 5)}
                          {" · "}{TYPE_MAP[c.type] ?? c.type}
                          {c.student_name && ` · ${c.student_name}`}
                        </p>
                        {c.topic && <p className="text-xs text-gray-500 mt-0.5">주제: {c.topic}</p>}
                        {c.parent_memo && <p className="text-xs text-gray-400 mt-0.5">학부모 메모: {c.parent_memo}</p>}
                        {c.teacher_memo && <p className="text-xs text-blue-500 mt-0.5">내 메모: {c.teacher_memo}</p>}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        {st.next && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
                            onClick={() => updateStatus(c.id, st.next!)}>
                            {st.nextLabel}
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="text-xs h-7"
                          onClick={() => { setMemoDialogId(c.id); setMemo(c.teacher_memo ?? ""); }}>
                          메모
                        </Button>
                        {c.status !== "cancelled" && c.status !== "completed" && (
                          <Button size="sm" variant="ghost" className="text-red-500 text-xs h-7"
                            onClick={() => updateStatus(c.id, "cancelled")}>
                            취소
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="slots">
          <div className="flex justify-end mb-3">
            <Button onClick={() => setSlotDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-1" />
              시간대 추가
            </Button>
          </div>
          <div className="space-y-2">
            {slots.map((s) => (
              <Card key={s.id} className={!s.is_available ? "opacity-50" : ""}>
                <CardContent className="p-3 flex items-center justify-between">
                  <span className="text-sm">
                    {formatDate(s.slot_date)} {String(s.start_time).slice(0, 5)}~{String(s.end_time).slice(0, 5)}
                  </span>
                  <Badge variant="outline" className={s.is_available ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}>
                    {s.is_available ? "예약 가능" : "예약됨"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 시간대 추가 다이얼로그 */}
      <Dialog open={slotDialogOpen} onOpenChange={setSlotDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>면담 시간대 추가</DialogTitle></DialogHeader>
          <form onSubmit={addSlot} className="space-y-4">
            <div className="space-y-1.5">
              <Label>날짜 *</Label>
              <Input type="date" value={slotForm.slot_date}
                onChange={(e) => setSlotForm({ ...slotForm, slot_date: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>시작 *</Label>
                <Input type="time" value={slotForm.start_time}
                  onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>종료 *</Label>
                <Input type="time" value={slotForm.end_time}
                  onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSlotDialogOpen(false)}>취소</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">추가</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 메모 다이얼로그 */}
      <Dialog open={!!memoDialogId} onOpenChange={() => setMemoDialogId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>면담 메모 — {activeConsultation?.parent_name}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="면담 관련 메모를 입력하세요"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemoDialogId(null)}>취소</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={saveMemo} disabled={loading}>
              {loading ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
