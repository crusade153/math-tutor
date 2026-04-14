"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import StudentDialog from "@/components/admin/StudentDialog";
import { gradeLabel } from "@/lib/utils";

interface StudentRow {
  id: number;
  name: string;
  grade: string;
  school: string | null;
  parent_id: number | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  pin: string | null;
  is_active: boolean;
}
type Student = StudentRow;

export default function StudentsClient({
  initialStudents,
}: {
  initialStudents: Student[];
}) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const filtered = students.filter(
    (s) =>
      s.name.includes(search) ||
      (s.parent_name?.includes(search) ?? false) ||
      (s.school?.includes(search) ?? false)
  );

  async function refresh() {
    const res = await fetch("/api/students");
    if (res.ok) {
      const json = await res.json();
      setStudents(json.data ?? []);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`"${name}" 학생을 삭제하시겠습니까?`)) return;
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("학생이 삭제되었습니다.");
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } else {
      toast.error("삭제 실패");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">학생 관리</h1>
          <p className="text-gray-500 text-sm mt-1">
            등록된 학생 {students.length}명
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingStudent(null);
            setDialogOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={16} className="mr-1" />
          학생 등록
        </Button>
      </div>

      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          className="pl-9"
          placeholder="이름, 학부모, 학교 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>학년</TableHead>
              <TableHead>학교</TableHead>
              <TableHead>학부모</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>QR PIN</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                  학생이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{gradeLabel(s.grade)}</TableCell>
                  <TableCell>{s.school ?? "-"}</TableCell>
                  <TableCell>{s.parent_name ?? "-"}</TableCell>
                  <TableCell>{s.parent_phone ?? "-"}</TableCell>
                  <TableCell>
                    {s.pin ? (
                      <Badge className="bg-blue-100 text-blue-700 font-mono" variant="outline">
                        {s.pin}
                      </Badge>
                    ) : (
                      <span className="text-gray-300 text-xs">미설정</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={s.is_active ? "default" : "secondary"}
                      className={s.is_active ? "bg-green-100 text-green-700" : ""}
                    >
                      {s.is_active ? "활성" : "비활성"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingStudent(s);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(s.id, s.name)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <StudentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        student={editingStudent as any}
        onSaved={refresh}
      />
    </div>
  );
}
