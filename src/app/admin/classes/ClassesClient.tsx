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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, UserPlus, X, Search } from "lucide-react";

interface Class {
  id: number;
  name: string;
  grade_level: string | null;
  schedule_desc: string | null;
  max_students: number;
  is_active: boolean;
  student_count: number;
}

interface Student {
  id: number;
  name: string;
  grade: string | null;
  school: string | null;
}

export default function ClassesClient({ initialClasses }: { initialClasses: Class[] }) {
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Class | null>(null);
  const [form, setForm] = useState({ name: "", grade_level: "", schedule_desc: "", max_students: "10" });
  const [loading, setLoading] = useState(false);

  // 학생 배분 다이얼로그
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function openCreate() {
    setEditing(null);
    setForm({ name: "", grade_level: "", schedule_desc: "", max_students: "10" });
    setDialogOpen(true);
  }

  function openEdit(c: Class) {
    setEditing(c);
    setForm({
      name: c.name,
      grade_level: c.grade_level ?? "",
      schedule_desc: c.schedule_desc ?? "",
      max_students: c.max_students.toString(),
    });
    setDialogOpen(true);
  }

  async function openStudentDialog(c: Class) {
    setSelectedClass(c);
    setSearchQuery("");
    setStudentDialogOpen(true);
    setStudentLoading(true);

    const [classRes, studentsRes] = await Promise.all([
      fetch(`/api/classes/${c.id}`),
      fetch("/api/students"),
    ]);

    if (classRes.ok && studentsRes.ok) {
      const classJson = await classRes.json();
      const studentsJson = await studentsRes.json();
      setEnrolledStudents(classJson.data.students ?? []);
      setAllStudents(studentsJson.data ?? []);
    } else {
      toast.error("학생 정보를 불러오지 못했습니다.");
      setStudentDialogOpen(false);
    }
    setStudentLoading(false);
  }

  async function handleEnroll(student: Student) {
    if (!selectedClass) return;
    const res = await fetch(`/api/classes/${selectedClass.id}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: student.id }),
    });
    if (res.ok) {
      setEnrolledStudents((prev) => [...prev, student]);
      // 반 카드의 student_count 업데이트
      setClasses((prev) =>
        prev.map((c) =>
          c.id === selectedClass.id ? { ...c, student_count: c.student_count + 1 } : c
        )
      );
      toast.success(`${student.name} 학생을 등록했습니다.`);
    } else {
      toast.error("등록 실패");
    }
  }

  async function handleUnenroll(student: Student) {
    if (!selectedClass) return;
    const res = await fetch(
      `/api/classes/${selectedClass.id}/students?student_id=${student.id}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setEnrolledStudents((prev) => prev.filter((s) => s.id !== student.id));
      setClasses((prev) =>
        prev.map((c) =>
          c.id === selectedClass.id ? { ...c, student_count: Math.max(0, c.student_count - 1) } : c
        )
      );
      toast.success(`${student.name} 학생을 제외했습니다.`);
    } else {
      toast.error("제외 실패");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { toast.error("반 이름을 입력해주세요."); return; }
    setLoading(true);

    const body = {
      name: form.name,
      grade_level: form.grade_level || null,
      schedule_desc: form.schedule_desc || null,
      max_students: parseInt(form.max_students) || 10,
    };

    const url = editing ? `/api/classes/${editing.id}` : "/api/classes";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(editing ? "수정되었습니다." : "반이 생성되었습니다.");
      await refresh();
      setDialogOpen(false);
    } else {
      const json = await res.json();
      toast.error(json.error ?? "저장 실패");
    }
    setLoading(false);
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`"${name}" 반을 삭제하시겠습니까?`)) return;
    const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("삭제되었습니다.");
      setClasses((prev) => prev.filter((c) => c.id !== id));
    } else {
      toast.error("삭제 실패");
    }
  }

  async function refresh() {
    const res = await fetch("/api/classes");
    if (res.ok) {
      const json = await res.json();
      setClasses(json.data ?? []);
    }
  }

  const enrolledIds = new Set(enrolledStudents.map((s) => s.id));
  const availableStudents = allStudents.filter(
    (s) =>
      !enrolledIds.has(s.id) &&
      (searchQuery === "" ||
        s.name.includes(searchQuery) ||
        (s.grade ?? "").includes(searchQuery) ||
        (s.school ?? "").includes(searchQuery))
  );
  const filteredEnrolled = enrolledStudents.filter(
    (s) =>
      searchQuery === "" ||
      s.name.includes(searchQuery) ||
      (s.grade ?? "").includes(searchQuery) ||
      (s.school ?? "").includes(searchQuery)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">반 관리</h1>
          <p className="text-gray-500 text-sm mt-1">총 {classes.length}개 반</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={16} className="mr-1" />
          반 생성
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <Card key={c.id} className={!c.is_active ? "opacity-60" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{c.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="학생 배분"
                    onClick={() => openStudentDialog(c)}
                  >
                    <UserPlus size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                    <Pencil size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => handleDelete(c.id, c.name)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {c.grade_level && (
                <Badge variant="outline" className="text-xs">
                  {c.grade_level}
                </Badge>
              )}
              {c.schedule_desc && (
                <p className="text-gray-600">{c.schedule_desc}</p>
              )}
              <div
                className="flex items-center gap-1 text-gray-500 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => openStudentDialog(c)}
              >
                <Users size={14} />
                <span>
                  {c.student_count} / {c.max_students}명
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {classes.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            등록된 반이 없습니다.
          </div>
        )}
      </div>

      {/* 반 생성/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "반 수정" : "반 생성"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>반 이름 *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 중등 화목반"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>대상 학년</Label>
              <Input
                value={form.grade_level}
                onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
                placeholder="예: 중학교 1-2학년"
              />
            </div>
            <div className="space-y-1.5">
              <Label>수업 일정</Label>
              <Textarea
                value={form.schedule_desc}
                onChange={(e) => setForm({ ...form, schedule_desc: e.target.value })}
                placeholder="예: 매주 화·목 오후 4시~6시"
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>최대 인원</Label>
              <Input
                type="number"
                value={form.max_students}
                onChange={(e) => setForm({ ...form, max_students: e.target.value })}
                min={1}
                max={30}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                취소
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 학생 배분 다이얼로그 */}
      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              학생 배분 — {selectedClass?.name}
              <span className="ml-2 text-sm font-normal text-gray-500">
                {enrolledStudents.length} / {selectedClass?.max_students}명
              </span>
            </DialogTitle>
          </DialogHeader>

          {studentLoading ? (
            <div className="py-12 text-center text-gray-400 text-sm">불러오는 중...</div>
          ) : (
            <div className="space-y-4">
              {/* 검색 */}
              <div className="relative">
                <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-8"
                  placeholder="이름, 학년, 학교로 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* 등록된 학생 */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  등록된 학생 ({enrolledStudents.length}명)
                </p>
                {filteredEnrolled.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2 text-center">
                    {searchQuery ? "검색 결과 없음" : "아직 배정된 학생이 없습니다."}
                  </p>
                ) : (
                  <ul className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {filteredEnrolled.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2"
                      >
                        <div>
                          <span className="text-sm font-medium">{s.name}</span>
                          {(s.grade || s.school) && (
                            <span className="text-xs text-gray-500 ml-2">
                              {[s.grade, s.school].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnenroll(s)}
                          className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                          title="제외"
                        >
                          <X size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 구분선 */}
              <div className="border-t" />

              {/* 추가 가능한 학생 */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  추가 가능한 학생 ({availableStudents.length}명)
                </p>
                {availableStudents.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2 text-center">
                    {searchQuery ? "검색 결과 없음" : "추가할 수 있는 학생이 없습니다."}
                  </p>
                ) : (
                  <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {availableStudents.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between rounded-lg hover:bg-gray-50 px-3 py-2 border border-transparent hover:border-gray-200 transition-colors"
                      >
                        <div>
                          <span className="text-sm font-medium">{s.name}</span>
                          {(s.grade || s.school) && (
                            <span className="text-xs text-gray-500 ml-2">
                              {[s.grade, s.school].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEnroll(s)}
                          className="text-gray-400 hover:text-blue-600 transition-colors ml-2"
                          title="추가"
                          disabled={enrolledStudents.length >= (selectedClass?.max_students ?? 0)}
                        >
                          <Plus size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setStudentDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
