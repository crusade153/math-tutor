"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageSquare, Reply } from "lucide-react";

export default function AdminParentInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await fetch("/api/parent-inquiries");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch (error) {
      toast.error("문의 내역을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const openReplyModal = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setReplyContent(inquiry.reply_content || "");
    setIsModalOpen(true);
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) {
      toast.error("답변 내용을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("/api/parent-inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedInquiry.id,
          replyContent,
        }),
      });

      if (res.ok) {
        toast.success("답변이 성공적으로 등록되었습니다.");
        setIsModalOpen(false);
        fetchInquiries();
      } else {
        // 🔥 서버에서 보낸 정확한 DB 에러 메시지를 가로채서 화면에 띄웁니다!
        const errorData = await res.json().catch(() => ({ error: "알 수 없는 오류" }));
        toast.error(`DB 에러 원인: ${errorData.error}`, { duration: 5000 });
      }
    } catch (error) {
      toast.error("네트워크 통신 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          학부모 문의 관리
        </h1>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[100px] text-center">상태</TableHead>
              <TableHead className="w-[150px]">학부모명</TableHead>
              <TableHead>문의 제목</TableHead>
              <TableHead className="w-[200px]">작성일시</TableHead>
              <TableHead className="w-[120px] text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                  데이터를 불러오는 중입니다...
                </TableCell>
              </TableRow>
            ) : inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                  등록된 문의내역이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((iq) => (
                <TableRow key={iq.id} className="hover:bg-gray-50">
                  <TableCell className="text-center">
                    <Badge
                      variant={iq.status === "answered" ? "default" : "destructive"}
                      className={iq.status === "answered" ? "bg-indigo-600" : ""}
                    >
                      {iq.status === "answered" ? "답변완료" : "답변대기"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{iq.parent_name} 학부모님</TableCell>
                  <TableCell>{iq.title}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(iq.created_at).toLocaleString("ko-KR")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant={iq.status === "answered" ? "outline" : "default"}
                      size="sm"
                      onClick={() => openReplyModal(iq)}
                      className="gap-1"
                    >
                      <Reply className="w-4 h-4" />
                      {iq.status === "answered" ? "답변수정" : "답변하기"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl border-b pb-4">
              문의 상세 및 답변 작성
            </DialogTitle>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-6 pt-2">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-800">
                    Q. {selectedInquiry.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    {selectedInquiry.parent_name} 학부모님
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedInquiry.content}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-indigo-700 flex items-center gap-1">
                  <span className="text-lg">A.</span> 선생님 답변
                </label>
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="학부모님께 보낼 답변을 친절하게 작성해주세요..."
                  rows={6}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleReplySubmit} className="bg-indigo-600 hover:bg-indigo-700">
              답변 등록/수정하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}