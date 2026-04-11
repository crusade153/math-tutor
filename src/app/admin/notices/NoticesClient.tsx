"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Megaphone, Pencil, Trash2, Search } from "lucide-react";

interface Notice {
  id: number;
  title: string;
  content: string;
  target: "all" | "class" | "individual";
  target_id: number | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const defaultForm = {
  title: "",
  content: "",
  target: "all",
  targetId: "",
  isPublished: true,
};

export default function NoticesClient() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [nRes, cRes, sRes] = await Promise.all([
        fetch("/api/notices"),
        fetch("/api/classes"),
        fetch("/api/students"),
      ]);
      const [nData, cData, sData] = await Promise.all([
        nRes.json(), cRes.json(), sRes.json(),
      ]);
      setNotices(nData.data ?? []);
      setClasses(cData.data ?? []);
      setStudents(sData.data ?? []);
    } catch {
      toast.error("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingNotice(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const openEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      target: notice.target,
      targetId: notice.target_id?.toString() ?? "",
      isPublished: notice.is_published,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      title: formData.title,
      content: formData.content,
      target: formData.target,
      targetId: formData.target === "all" ? null : parseInt(formData.targetId) || null,
      isPublished: formData.isPublished,
    };

    try {
      const res = editingNotice
        ? await fetch(`/api/notices/${editingNotice.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/notices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      if (res.ok) {
        toast.success(editingNotice ? "알림장이 수정되었습니다." : "알림장이 작성되었습니다.");
        setIsModalOpen(false);
        fetchData();
      } else {
        toast.error("저장 중 오류가 발생했습니다.");
      }
    } catch {
      toast.error("서버 통신 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (notice: Notice) => {
    if (!window.confirm(`"${notice.title}" 알림장을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/notices/${notice.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("알림장이 삭제되었습니다.");
        setNotices((prev) => prev.filter((n) => n.id !== notice.id));
      } else {
        toast.error("삭제 중 오류가 발생했습니다.");
      }
    } catch {
      toast.error("서버 통신 중 오류가 발생했습니다.");
    }
  };

  const filtered = notices.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-primary" /> 알림장 관리
        </h2>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" /> 알림장 작성
        </Button>
      </div>

      {/* 검색 */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="제목으로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 테이블 */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">대상</TableHead>
              <TableHead className="w-[80px]">발행</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="w-[130px]">작성일</TableHead>
              <TableHead className="w-[90px] text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                  데이터를 불러오는 중입니다...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                  {search ? "검색 결과가 없습니다." : "작성된 알림장이 없습니다."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell>
                    {notice.target === "all" && <Badge variant="outline">전체</Badge>}
                    {notice.target === "class" && <Badge variant="secondary">반별</Badge>}
                    {notice.target === "individual" && <Badge>개인</Badge>}
                  </TableCell>
                  <TableCell>
                    {notice.is_published ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200" variant="outline">발행됨</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-400">미발행</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{notice.title}</TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(notice.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(notice)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(notice)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 작성/수정 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingNotice ? "알림장 수정" : "새 알림장 작성"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">수신 대상</label>
              <Select
                value={formData.target}
                onValueChange={(v) => setFormData({ ...formData, target: v || "all", targetId: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="대상 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 공지</SelectItem>
                  <SelectItem value="class">특정 반</SelectItem>
                  <SelectItem value="individual">개인 알림장</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.target === "class" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">반 선택</label>
                <Select
                  value={formData.targetId}
                  onValueChange={(v) => setFormData({ ...formData, targetId: v || "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="반을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.target === "individual" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">학생 선택</label>
                <Select
                  value={formData.targetId}
                  onValueChange={(v) => setFormData({ ...formData, targetId: v || "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="학생을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name} ({s.school})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">제목</label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="제목을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">내용</label>
              <Textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="내용을 입력하세요"
                rows={5}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isPublished"
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              />
              <label htmlFor="isPublished" className="text-sm font-medium cursor-pointer">
                즉시 발행
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                취소
              </Button>
              <Button type="submit">
                {editingNotice ? "수정하기" : "발송하기"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
