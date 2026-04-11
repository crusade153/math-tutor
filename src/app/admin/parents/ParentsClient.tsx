"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
} from "lucide-react";

interface StudentInfo {
  id: number;
  name: string;
  grade: string;
}

interface ParentRow {
  id: number;
  username: string;
  name: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  students: StudentInfo[] | null;
}

type DialogMode = "create" | "edit" | "password" | null;

export default function ParentsClient({
  initialParents,
}: {
  initialParents: ParentRow[];
}) {
  const [parents, setParents] = useState<ParentRow[]>(initialParents);
  const [search, setSearch] = useState("");
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selected, setSelected] = useState<ParentRow | null>(null);

  // 폼 상태
  const [form, setForm] = useState({ name: "", username: "", phone: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const filtered = parents.filter(
    (p) =>
      p.name.includes(search) ||
      p.username.includes(search) ||
      (p.phone?.includes(search) ?? false)
  );

  async function refresh() {
    const res = await fetch("/api/parents");
    if (res.ok) {
      const json = await res.json();
      setParents(json.data ?? []);
    }
  }

  function openCreate() {
    setSelected(null);
    setForm({ name: "", username: "", phone: "", password: "1234" });
    setShowPw(false);
    setDialogMode("create");
  }

  function openEdit(p: ParentRow) {
    setSelected(p);
    setForm({ name: p.name, username: p.username, phone: p.phone ?? "", password: "" });
    setDialogMode("edit");
  }

  function openPassword(p: ParentRow) {
    setSelected(p);
    setForm({ ...form, password: "" });
    setShowPw(false);
    setDialogMode("password");
  }

  async function handleCreate() {
    if (!form.name || !form.username) {
      toast.error("이름과 아이디는 필수입니다.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/parents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const json = await res.json();
      toast.success(`학부모 계정이 생성되었습니다. (비밀번호: ${json.data.password})`);
      setDialogMode(null);
      refresh();
    } else {
      const json = await res.json();
      toast.error(json.error ?? "생성 실패");
    }
    setLoading(false);
  }

  async function handleEdit() {
    if (!selected) return;
    setLoading(true);
    const res = await fetch(`/api/parents/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, phone: form.phone || null }),
    });
    if (res.ok) {
      toast.success("학부모 정보가 수정되었습니다.");
      setDialogMode(null);
      refresh();
    } else {
      toast.error("수정 실패");
    }
    setLoading(false);
  }

  async function handlePasswordReset() {
    if (!selected || !form.password) {
      toast.error("새 비밀번호를 입력하세요.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/parents/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: form.password }),
    });
    if (res.ok) {
      toast.success("비밀번호가 변경되었습니다.");
      setDialogMode(null);
    } else {
      toast.error("변경 실패");
    }
    setLoading(false);
  }

  async function handleToggleActive(p: ParentRow) {
    const res = await fetch(`/api/parents/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !p.is_active }),
    });
    if (res.ok) {
      toast.success(p.is_active ? "계정이 비활성화되었습니다." : "계정이 활성화되었습니다.");
      setParents((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, is_active: !x.is_active } : x))
      );
    } else {
      toast.error("변경 실패");
    }
  }

  async function handleDelete(p: ParentRow) {
    if (!confirm(`"${p.name}" 학부모 계정을 삭제하시겠습니까?\n연결된 자녀 데이터는 유지됩니다.`))
      return;
    const res = await fetch(`/api/parents/${p.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("학부모 계정이 삭제되었습니다.");
      setParents((prev) => prev.filter((x) => x.id !== p.id));
    } else {
      toast.error("삭제 실패");
    }
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">학부모 관리</h1>
          <p className="text-gray-500 text-sm mt-1">
            등록된 학부모 {parents.length}명 · 로그인 계정 생성/수정/삭제
          </p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
          <Plus size={16} className="mr-1" />
          학부모 계정 생성
        </Button>
      </div>

      {/* 검색 */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="이름, 아이디, 연락처 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 테이블 (데스크탑) */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">이름</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">아이디</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">연락처</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">자녀</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">상태</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  학부모가 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.username}</td>
                  <td className="px-4 py-3">{p.phone ?? "-"}</td>
                  <td className="px-4 py-3">
                    {p.students && p.students.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {p.students.map((s) => (
                          <Badge key={s.id} variant="secondary" className="text-xs">
                            {s.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={p.is_active ? "default" : "secondary"}
                      className={p.is_active ? "bg-green-100 text-green-700" : ""}
                    >
                      {p.is_active ? "활성" : "비활성"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="정보 수정"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="비밀번호 변경"
                        onClick={() => openPassword(p)}
                      >
                        <KeyRound size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title={p.is_active ? "비활성화" : "활성화"}
                        onClick={() => handleToggleActive(p)}
                        className={p.is_active ? "text-orange-500 hover:text-orange-700" : "text-green-500 hover:text-green-700"}
                      >
                        {p.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="삭제"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(p)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 카드 목록 (모바일) */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-white rounded-xl border">
            학부모가 없습니다.
          </div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{p.username}</p>
                </div>
                <Badge
                  variant={p.is_active ? "default" : "secondary"}
                  className={p.is_active ? "bg-green-100 text-green-700" : ""}
                >
                  {p.is_active ? "활성" : "비활성"}
                </Badge>
              </div>
              {p.phone && <p className="text-sm text-gray-600">{p.phone}</p>}
              {p.students && p.students.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.students.map((s) => (
                    <Badge key={s.id} variant="secondary" className="text-xs">
                      {s.name}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-1 border-t">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(p)}>
                  <Pencil size={13} className="mr-1" />
                  수정
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => openPassword(p)}>
                  <KeyRound size={13} className="mr-1" />
                  비밀번호
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-orange-500"
                  onClick={() => handleToggleActive(p)}
                >
                  {p.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500"
                  onClick={() => handleDelete(p)}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 생성 다이얼로그 */}
      <Dialog open={dialogMode === "create"} onOpenChange={() => setDialogMode(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>학부모 계정 생성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>이름 *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="학부모님 이름"
              />
            </div>
            <div className="space-y-1.5">
              <Label>아이디 *</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="로그인 아이디"
              />
            </div>
            <div className="space-y-1.5">
              <Label>연락처</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="010-0000-0000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>초기 비밀번호</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="기본값: 1234"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-400">비워두면 자동으로 1234로 설정됩니다.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogMode(null)}>
                취소
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? "생성 중..." : "계정 생성"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 수정 다이얼로그 */}
      <Dialog open={dialogMode === "edit"} onOpenChange={() => setDialogMode(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>학부모 정보 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>아이디</Label>
              <Input value={form.username} disabled className="bg-gray-50 text-gray-400" />
              <p className="text-xs text-gray-400">아이디는 변경할 수 없습니다.</p>
            </div>
            <div className="space-y-1.5">
              <Label>이름 *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="학부모님 이름"
              />
            </div>
            <div className="space-y-1.5">
              <Label>연락처</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="010-0000-0000"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogMode(null)}>
                취소
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                onClick={handleEdit}
                disabled={loading}
              >
                {loading ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 비밀번호 변경 다이얼로그 */}
      <Dialog open={dialogMode === "password"} onOpenChange={() => setDialogMode(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{selected?.name}</span> 학부모님의 비밀번호를 변경합니다.
            </p>
            <div className="space-y-1.5">
              <Label>새 비밀번호 *</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="새 비밀번호 입력"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogMode(null)}>
                취소
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                onClick={handlePasswordReset}
                disabled={loading}
              >
                {loading ? "변경 중..." : "변경"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
