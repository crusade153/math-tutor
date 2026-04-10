"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Notice {
  id: number;
  title: string;
  content: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export default function NoticesClient({ notices: initialNotices }: { notices: Notice[] }) {
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [form, setForm] = useState({ title: "", content: "", is_published: false });
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm({ title: "", content: "", is_published: false });
    setDialogOpen(true);
  }

  function openEdit(n: Notice) {
    setEditing(n);
    setForm({ title: n.title, content: n.content, is_published: n.is_published });
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.content) { toast.error("제목과 내용을 입력해주세요."); return; }
    setLoading(true);

    const url = editing ? `/api/notices/${editing.id}` : "/api/notices";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success(editing ? "수정되었습니다." : "등록되었습니다.");
      await refresh();
      setDialogOpen(false);
    } else {
      const json = await res.json();
      toast.error(json.error ?? "저장 실패");
    }
    setLoading(false);
  }

  async function togglePublish(n: Notice) {
    const res = await fetch(`/api/notices/${n.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !n.is_published }),
    });
    if (res.ok) {
      toast.success(!n.is_published ? "공개되었습니다." : "비공개로 변경되었습니다.");
      setNotices((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, is_published: !item.is_published } : item
        )
      );
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("삭제하시겠습니까?")) return;
    const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("삭제되었습니다.");
      setNotices((prev) => prev.filter((n) => n.id !== id));
    }
  }

  async function refresh() {
    const res = await fetch("/api/notices");
    if (res.ok) {
      const json = await res.json();
      setNotices(json.data ?? []);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">알림장 관리</h1>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={16} className="mr-1" />
          알림장 작성
        </Button>
      </div>

      {notices.length === 0 ? (
        <p className="text-center text-gray-400 py-8">작성된 알림장이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {notices.map((n) => (
            <Card key={n.id} className={!n.is_published ? "opacity-70" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {n.title}
                    <Badge
                      variant="outline"
                      className={n.is_published ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}
                    >
                      {n.is_published ? "공개" : "비공개"}
                    </Badge>
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => togglePublish(n)}>
                      {n.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(n)}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(n.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{formatDate(n.created_at)}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">
                  {n.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "알림장 수정" : "알림장 작성"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>제목 *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>내용 *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={6}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="publish"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="publish" className="cursor-pointer">즉시 공개</Label>
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
