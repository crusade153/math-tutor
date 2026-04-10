"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import ScoreChart from "@/components/admin/ScoreChart";
import { gradeLabel } from "@/lib/utils";

interface Score {
  id: number;
  student_id: number;
  exam_name: string;
  score: number;
  max_score: number;
  exam_date: string;
  class_name?: string;
}

interface Student { id: number; name: string; grade: string; }
interface Class { id: number; name: string; }

export default function ScoresClient({
  students,
  classes,
}: {
  students: Student[];
  classes: Class[];
}) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [scores, setScores] = useState<Score[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    exam_name: "", score: "", max_score: "100",
    exam_date: new Date().toISOString().slice(0, 10),
    class_id: "",
  });
  const [loading, setLoading] = useState(false);

  async function loadScores(studentId: string) {
    setSelectedStudentId(studentId);
    const res = await fetch(`/api/scores?studentId=${studentId}`);
    if (res.ok) {
      const json = await res.json();
      setScores(json.data ?? []);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudentId) { toast.error("학생을 선택해주세요."); return; }
    if (!form.exam_name || !form.score || !form.exam_date) {
      toast.error("필수 항목을 입력해주세요."); return;
    }
    setLoading(true);

    const res = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: parseInt(selectedStudentId),
        class_id: form.class_id ? parseInt(form.class_id) : null,
        exam_name: form.exam_name,
        score: parseFloat(form.score),
        max_score: parseFloat(form.max_score) || 100,
        exam_date: form.exam_date,
      }),
    });

    if (res.ok) {
      toast.success("성적이 등록되었습니다.");
      await loadScores(selectedStudentId);
      setDialogOpen(false);
      setForm({ exam_name: "", score: "", max_score: "100", exam_date: new Date().toISOString().slice(0, 10), class_id: "" });
    } else {
      const json = await res.json();
      toast.error(json.error ?? "등록 실패");
    }
    setLoading(false);
  }

  const selectedStudent = students.find((s) => s.id.toString() === selectedStudentId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">성적 관리</h1>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!selectedStudentId}
        >
          <Plus size={16} className="mr-1" />
          성적 입력
        </Button>
      </div>

      <div className="mb-6">
        <Label className="mb-2 block">학생 선택</Label>
        <Select value={selectedStudentId} onValueChange={(v) => v !== null && loadScores(v)}>
          <SelectTrigger className="w-full md:w-72">
            <SelectValue placeholder="학생을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {s.name} ({gradeLabel(s.grade)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStudent && (
        <div className="space-y-6">
          {/* 성적 차트 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedStudent.name} — 성적 추이
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreChart scores={scores} />
            </CardContent>
          </Card>

          {/* 성적 목록 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">성적 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {scores.length === 0 ? (
                <p className="text-center text-gray-400 py-6 text-sm">
                  성적 기록이 없습니다.
                </p>
              ) : (
                <div className="space-y-2">
                  {scores.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-sm">{s.exam_name}</p>
                        <p className="text-xs text-gray-400">
                          {s.exam_date?.slice(0, 10)}
                          {s.class_name && ` · ${s.class_name}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-blue-600">
                          {s.score}
                        </span>
                        <span className="text-sm text-gray-400">
                          /{s.max_score}
                        </span>
                        <Badge
                          className="ml-2 text-xs"
                          variant="outline"
                        >
                          {Math.round((Number(s.score) / Number(s.max_score)) * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>성적 입력 — {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>시험명 *</Label>
              <Input
                value={form.exam_name}
                onChange={(e) => setForm({ ...form, exam_name: e.target.value })}
                placeholder="예: 2월 월말평가"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>점수 *</Label>
                <Input
                  type="number"
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: e.target.value })}
                  placeholder="0"
                  min={0}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>만점</Label>
                <Input
                  type="number"
                  value={form.max_score}
                  onChange={(e) => setForm({ ...form, max_score: e.target.value })}
                  min={1}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>시험 날짜 *</Label>
              <Input
                type="date"
                value={form.exam_date}
                onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>반 (선택)</Label>
              <Select value={form.class_id} onValueChange={(v) => v !== null && setForm({ ...form, class_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="반 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">없음</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
