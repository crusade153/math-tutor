"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { gradeLabel } from "@/lib/utils";

interface Tuition {
  id: number;
  student_id: number;
  student_name: string;
  grade: string;
  month: string;
  amount: number;
  is_paid: boolean;
  paid_at: string | null;
  note: string | null;
}

interface Student { id: number; name: string; grade: string; }

export default function TuitionClient({
  tuition: initialTuition,
  students,
  currentMonth,
}: {
  tuition: Tuition[];
  students: Student[];
  currentMonth: string;
}) {
  const [tuition, setTuition] = useState<Tuition[]>(initialTuition);
  const [month, setMonth] = useState(currentMonth);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ student_id: "", amount: "", note: "" });
  const [loading, setLoading] = useState(false);

  async function navigate(dir: number) {
    const [y, m] = month.split("-").map(Number);
    let newM = m + dir;
    let newY = y;
    if (newM > 12) { newM = 1; newY++; }
    if (newM < 1) { newM = 12; newY--; }
    const newMonth = `${newY}-${String(newM).padStart(2, "0")}`;
    setMonth(newMonth);
    await loadTuition(newMonth);
  }

  async function loadTuition(m: string) {
    const res = await fetch(`/api/tuition?month=${m}`);
    if (res.ok) {
      const json = await res.json();
      setTuition(json.data ?? []);
    }
  }

  async function togglePaid(t: Tuition) {
    const res = await fetch(`/api/tuition/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_paid: !t.is_paid }),
    });
    if (res.ok) {
      toast.success(!t.is_paid ? "납부 완료로 변경되었습니다." : "미납으로 변경되었습니다.");
      setTuition((prev) =>
        prev.map((item) =>
          item.id === t.id ? { ...item, is_paid: !item.is_paid } : item
        )
      );
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.student_id || !form.amount) { toast.error("학생과 금액을 입력해주세요."); return; }
    setLoading(true);

    const res = await fetch("/api/tuition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: parseInt(form.student_id),
        month,
        amount: parseInt(form.amount),
        note: form.note || null,
      }),
    });

    if (res.ok) {
      toast.success("등록되었습니다.");
      await loadTuition(month);
      setDialogOpen(false);
      setForm({ student_id: "", amount: "", note: "" });
    } else {
      const json = await res.json();
      toast.error(json.error ?? "저장 실패");
    }
    setLoading(false);
  }

  const paidCount = tuition.filter((t) => t.is_paid).length;
  const unpaidCount = tuition.length - paidCount;
  const totalAmount = tuition.reduce((sum, t) => sum + (t.is_paid ? t.amount : 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">수업료 관리</h1>
        <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={16} className="mr-1" />
          수업료 등록
        </Button>
      </div>

      {/* 월 네비게이션 */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} />
        </Button>
        <span className="font-semibold">{month}</span>
        <Button variant="outline" size="sm" onClick={() => navigate(1)}>
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-xs text-gray-400">납부 완료</p>
            <p className="text-xl font-bold text-green-600">{paidCount}명</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-xs text-gray-400">미납</p>
            <p className="text-xl font-bold text-red-500">{unpaidCount}명</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-xs text-gray-400">수납 합계</p>
            <p className="text-lg font-bold text-blue-600">
              {totalAmount.toLocaleString()}원
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>학생</TableHead>
              <TableHead>학년</TableHead>
              <TableHead>수업료</TableHead>
              <TableHead>납부 상태</TableHead>
              <TableHead>메모</TableHead>
              <TableHead className="text-right">변경</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tuition.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  이 달의 수업료 데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              tuition.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.student_name}</TableCell>
                  <TableCell className="text-sm text-gray-500">{gradeLabel(t.grade)}</TableCell>
                  <TableCell>{t.amount.toLocaleString()}원</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={t.is_paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}
                    >
                      {t.is_paid ? "납부완료" : "미납"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-400">{t.note ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePaid(t)}
                      className={t.is_paid ? "text-gray-400" : "text-green-600"}
                    >
                      {t.is_paid ? <Circle size={18} /> : <CheckCircle2 size={18} />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>수업료 등록 — {month}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>학생 *</Label>
              <Select value={form.student_id} onValueChange={(v) => v !== null && setForm({ ...form, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="학생 선택" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name} ({gradeLabel(s.grade)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>금액 *</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="예: 300000"
                min={0}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>메모</Label>
              <Input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="참고 사항"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>취소</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
