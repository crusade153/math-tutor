"use client";

import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { GRADE_OPTIONS } from "@/lib/utils";

interface Parent {
  id: number;
  name: string;
  email: string;
}

interface Student {
  id?: number;
  name: string;
  grade: string;
  school: string;
  parent_id: number | null;
  pin?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  student?: Student | null;
  onSaved: () => void;
}

export default function StudentDialog({ open, onClose, student, onSaved }: Props) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [pin, setPin] = useState("");
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(student?.name ?? "");
      setGrade(student?.grade ?? "");
      setSchool(student?.school ?? "");
      setParentId(student?.parent_id?.toString() ?? "");
      setPin(student?.pin ?? "");
      fetchParents();
    }
  }, [open, student]);

  async function fetchParents() {
    const res = await fetch("/api/parents");
    if (res.ok) {
      const json = await res.json();
      setParents(json.data ?? []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !grade) {
      toast.error("이름과 학년은 필수입니다.");
      return;
    }
    if (pin && !/^\d{4}$/.test(pin)) {
      toast.error("PIN은 4자리 숫자여야 합니다.");
      return;
    }
    setLoading(true);

    const body = {
      name,
      grade,
      school: school || null,
      parent_id: parentId ? parseInt(parentId) : null,
      pin: pin || null,
    };

    const url = student?.id ? `/api/students/${student.id}` : "/api/students";
    const method = student?.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(student?.id ? "학생 정보가 수정되었습니다." : "학생이 등록되었습니다.");
      onSaved();
      onClose();
    } else {
      const json = await res.json();
      toast.error(json.error ?? "저장 실패");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{student?.id ? "학생 정보 수정" : "학생 등록"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>이름 *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="학생 이름"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>학년 *</Label>
            <Select value={grade} onValueChange={(v) => v !== null && setGrade(v)}>
              <SelectTrigger>
                <SelectValue placeholder="학년 선택" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_OPTIONS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>학교</Label>
            <Input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="학교명"
            />
          </div>
          <div className="space-y-1.5">
            <Label>QR 출결 PIN (4자리 숫자)</Label>
            <Input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="예: 1234"
              inputMode="numeric"
              maxLength={4}
            />
            <p className="text-xs text-gray-400">
              학생이 QR 스캔 후 입력하는 번호. 공부방 전체에서 고유해야 합니다.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>학부모 연결</Label>
            <Select value={parentId} onValueChange={(v) => v !== null && setParentId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="학부모 선택 (선택)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">없음</SelectItem>
                {parents.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name} ({p.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
