"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

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

interface Class {
  id: number;
  name: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  scheduled: { label: "예정", color: "bg-blue-100 text-blue-700" },
  completed: { label: "완료", color: "bg-green-100 text-green-700" },
  cancelled: { label: "휴강", color: "bg-red-100 text-red-700" },
  makeup: { label: "보강", color: "bg-amber-100 text-amber-700" },
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function generateDates(startDate: string, endDate: string, days: number[]): string[] {
  const dates: string[] = [];
  const cur = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  while (cur <= end) {
    if (days.includes(cur.getDay())) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, "0");
      const d = String(cur.getDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${d}`);
    }
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export default function LessonsClient({
  lessons: initialLessons,
  classes,
  year: initialYear,
  month: initialMonth,
}: {
  lessons: Lesson[];
  classes: Class[];
  year: number;
  month: string;
}) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [mode, setMode] = useState<"single" | "recurring">("single");

  // 단건 폼
  const [form, setForm] = useState({
    class_id: "",
    lesson_date: "",
    start_time: "",
    end_time: "",
    topic: "",
    status: "scheduled",
  });

  // 반복 폼
  const [recurring, setRecurring] = useState({
    class_id: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    topic: "",
    days: [] as number[],
  });

  const [loading, setLoading] = useState(false);

  // 캘린더 날짜 계산
  const daysInMonth = new Date(year, parseInt(month), 0).getDate();
  const firstDayOfWeek = new Date(year, parseInt(month) - 1, 1).getDay();

  function getLessonsForDate(day: number) {
    const dateStr = `${year}-${month}-${String(day).padStart(2, "0")}`;
    return lessons.filter((l) => l.lesson_date.slice(0, 10) === dateStr);
  }

  async function navigate(dir: number) {
    let newMonth = parseInt(month) + dir;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    const m = String(newMonth).padStart(2, "0");
    setYear(newYear);
    setMonth(m);

    const res = await fetch(`/api/lessons?year=${newYear}&month=${newMonth}`);
    if (res.ok) {
      const json = await res.json();
      setLessons(json.data ?? []);
    }
  }

  function openCreate(date?: string) {
    setEditing(null);
    setMode("single");
    setForm({ class_id: "", lesson_date: date ?? "", start_time: "", end_time: "", topic: "", status: "scheduled" });
    setRecurring({ class_id: "", start_date: date ?? "", end_date: "", start_time: "", end_time: "", topic: "", days: [] });
    setDialogOpen(true);
  }

  function openEdit(lesson: Lesson) {
    setEditing(lesson);
    setMode("single");
    setForm({
      class_id: lesson.class_id.toString(),
      lesson_date: lesson.lesson_date.slice(0, 10),
      start_time: lesson.start_time.slice(0, 5),
      end_time: lesson.end_time.slice(0, 5),
      topic: lesson.topic ?? "",
      status: lesson.status,
    });
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.class_id || !form.lesson_date || !form.start_time || !form.end_time) {
      toast.error("필수 항목을 입력해주세요.");
      return;
    }
    setLoading(true);

    const body = {
      class_id: parseInt(form.class_id),
      lesson_date: form.lesson_date,
      start_time: form.start_time,
      end_time: form.end_time,
      topic: form.topic || null,
      status: form.status,
    };

    const url = editing ? `/api/lessons/${editing.id}` : "/api/lessons";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(editing ? "수정되었습니다." : "수업이 등록되었습니다.");
      await refresh();
      setDialogOpen(false);
    } else {
      const json = await res.json();
      toast.error(json.error ?? "저장 실패");
    }
    setLoading(false);
  }

  async function handleRecurringSave(e: React.FormEvent) {
    e.preventDefault();
    if (!recurring.class_id || !recurring.start_date || !recurring.end_date || !recurring.start_time || !recurring.end_time) {
      toast.error("필수 항목을 입력해주세요.");
      return;
    }
    if (recurring.days.length === 0) {
      toast.error("반복할 요일을 하나 이상 선택해주세요.");
      return;
    }
    if (recurring.start_date > recurring.end_date) {
      toast.error("종료일은 시작일 이후여야 합니다.");
      return;
    }

    const dates = generateDates(recurring.start_date, recurring.end_date, recurring.days);
    if (dates.length === 0) {
      toast.error("선택한 요일에 해당하는 날짜가 없습니다.");
      return;
    }

    setLoading(true);
    const lessons = dates.map((d) => ({
      class_id: parseInt(recurring.class_id),
      lesson_date: d,
      start_time: recurring.start_time,
      end_time: recurring.end_time,
      topic: recurring.topic || null,
    }));

    const res = await fetch("/api/lessons/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessons }),
    });

    if (res.ok) {
      toast.success(`총 ${dates.length}개의 수업이 등록되었습니다.`);
      await refresh();
      setDialogOpen(false);
    } else {
      const json = await res.json();
      toast.error(json.error ?? "저장 실패");
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!editing) return;
    if (!confirm("이 수업을 삭제하시겠습니까?\n출결 기록도 함께 삭제됩니다.")) return;

    setLoading(true);
    const res = await fetch(`/api/lessons/${editing.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("수업이 삭제되었습니다.");
      await refresh();
      setDialogOpen(false);
    } else {
      const json = await res.json();
      toast.error(json.error ?? "삭제 실패");
    }
    setLoading(false);
  }

  async function refresh() {
    const res = await fetch(`/api/lessons?year=${year}&month=${parseInt(month)}`);
    if (res.ok) {
      const json = await res.json();
      setLessons(json.data ?? []);
    }
  }

  function toggleDay(day: number) {
    setRecurring((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">수업 일정</h1>
        <Button onClick={() => openCreate()} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={16} className="mr-1" />
          수업 등록
        </Button>
      </div>

      {/* 월 네비게이션 */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} />
        </Button>
        <span className="font-semibold text-lg">
          {year}년 {parseInt(month)}월
        </span>
        <Button variant="outline" size="sm" onClick={() => navigate(1)}>
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* 캘린더 */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] border-b border-r p-1" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayLessons = getLessonsForDate(day);
            const dateStr = `${year}-${month}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === new Date().toISOString().slice(0, 10);

            return (
              <div
                key={day}
                className="min-h-[80px] border-b border-r p-1 cursor-pointer hover:bg-gray-50"
                onClick={() => openCreate(dateStr)}
              >
                <div
                  className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? "bg-blue-600 text-white" : "text-gray-700"
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayLessons.map((l) => {
                    const st = STATUS_MAP[l.status] ?? STATUS_MAP.scheduled;
                    return (
                      <div
                        key={l.id}
                        className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${st.color}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(l);
                        }}
                      >
                        {l.start_time.slice(0, 5)} {l.class_name}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 다이얼로그 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "수업 수정" : "수업 등록"}</DialogTitle>
          </DialogHeader>

          {/* 등록 모드 탭 (신규 등록 시에만 표시) */}
          {!editing && (
            <div className="flex rounded-lg border overflow-hidden mb-2">
              <button
                type="button"
                className={`flex-1 py-1.5 text-sm font-medium transition-colors ${
                  mode === "single" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setMode("single")}
              >
                단건 등록
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-sm font-medium transition-colors ${
                  mode === "recurring" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setMode("recurring")}
              >
                반복 등록
              </button>
            </div>
          )}

          {/* 단건 등록 폼 */}
          {(editing || mode === "single") && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label>반 *</Label>
                <Select value={form.class_id} onValueChange={(v) => v !== null && setForm({ ...form, class_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="반 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>날짜 *</Label>
                <Input
                  type="date"
                  value={form.lesson_date}
                  onChange={(e) => setForm({ ...form, lesson_date: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>시작 시간 *</Label>
                  <Input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>종료 시간 *</Label>
                  <Input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>수업 주제</Label>
                <Input
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="예: 이차방정식"
                />
              </div>
              {editing && (
                <div className="space-y-1.5">
                  <Label>상태</Label>
                  <Select value={form.status} onValueChange={(v) => v !== null && setForm({ ...form, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_MAP).map(([v, { label }]) => (
                        <SelectItem key={v} value={v}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <DialogFooter className="gap-2">
                {editing && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    <Trash2 size={15} className="mr-1" />
                    삭제
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>취소</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? "저장 중..." : "저장"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* 반복 등록 폼 */}
          {!editing && mode === "recurring" && (
            <form onSubmit={handleRecurringSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label>반 *</Label>
                <Select value={recurring.class_id} onValueChange={(v) => v !== null && setRecurring({ ...recurring, class_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="반 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>시작일 *</Label>
                  <Input
                    type="date"
                    value={recurring.start_date}
                    onChange={(e) => setRecurring({ ...recurring, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>종료일 *</Label>
                  <Input
                    type="date"
                    value={recurring.end_date}
                    onChange={(e) => setRecurring({ ...recurring, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>반복 요일 *</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {WEEKDAYS.map((label, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`w-9 h-9 rounded-full text-sm font-medium border transition-colors ${
                        recurring.days.includes(idx)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "text-gray-600 border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>시작 시간 *</Label>
                  <Input
                    type="time"
                    value={recurring.start_time}
                    onChange={(e) => setRecurring({ ...recurring, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>종료 시간 *</Label>
                  <Input
                    type="time"
                    value={recurring.end_time}
                    onChange={(e) => setRecurring({ ...recurring, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>수업 주제</Label>
                <Input
                  value={recurring.topic}
                  onChange={(e) => setRecurring({ ...recurring, topic: e.target.value })}
                  placeholder="예: 이차방정식"
                />
              </div>
              {recurring.class_id && recurring.start_date && recurring.end_date && recurring.days.length > 0 && (
                <p className="text-xs text-gray-500">
                  예상 등록 수업 수:{" "}
                  <span className="font-semibold text-blue-600">
                    {generateDates(recurring.start_date, recurring.end_date, recurring.days).length}개
                  </span>
                </p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>취소</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? "등록 중..." : "일괄 등록"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
