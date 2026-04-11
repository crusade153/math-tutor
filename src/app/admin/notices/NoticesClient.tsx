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
import { Plus, Megaphone } from "lucide-react";

export default function NoticesClient() {
  const [notices, setNotices] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 신규 알림장 상태
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    target: "all", // all, class, individual
    targetId: "",
    isPublished: true,
  });

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
      setNotices(await nRes.json());
      setClasses(await cRes.json());
      setStudents(await sRes.json());
    } catch (error) {
      toast.error("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          targetId: formData.target === "all" ? null : parseInt(formData.targetId),
        }),
      });

      if (res.ok) {
        toast.success("알림장이 작성되었습니다.");
        setIsModalOpen(false);
        setFormData({ title: "", content: "", target: "all", targetId: "", isPublished: true });
        fetchData();
      } else {
        toast.error("저장 중 오류가 발생했습니다.");
      }
    } catch (error) {
      toast.error("서버 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-primary" /> 알림장 관리
        </h2>
        
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" /> 알림장 작성
        </Button>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>새 알림장 작성</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">수신 대상</label>
                <Select
                  value={formData.target}
                  // 💡 해결: 값이 null일 경우 기본값 'all'을 사용하도록 || "all" 추가
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
                    // 💡 해결: 값이 null일 경우 빈 문자열("")을 사용하도록 방어
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
                    // 💡 해결: 동일하게 null 방어 코드 추가
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
              <DialogFooter>
                <Button type="submit" className="w-full">
                  발송하기
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">대상</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="w-[150px]">작성일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-gray-500">
                  데이터를 불러오는 중입니다...
                </TableCell>
              </TableRow>
            ) : notices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-gray-500">
                  작성된 알림장이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              notices.map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell>
                    {notice.target === "all" && <Badge variant="outline">전체</Badge>}
                    {notice.target === "class" && <Badge variant="secondary">반별</Badge>}
                    {notice.target === "individual" && <Badge variant="default">개인</Badge>}
                  </TableCell>
                  <TableCell className="font-medium">{notice.title}</TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(notice.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}