"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageSquarePlus } from "lucide-react";

export default function ParentInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch("/api/parent-inquiries");
    if (res.ok) {
      setInquiries(await res.json());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/parent-inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    
    if (res.ok) {
      toast.success("문의사항이 등록되었습니다.");
      setIsModalOpen(false);
      setFormData({ title: "", content: "" });
      fetchData();
    } else {
      toast.error("등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">1:1 문의 내역</h1>

        {/* 💡 에러 해결: DialogTrigger를 삭제하고 Button에 onClick 이벤트를 직접 연결했습니다. */}
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <MessageSquarePlus className="w-4 h-4" /> 문의하기
        </Button>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>선생님께 문의하기</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <Input
                required
                placeholder="제목을 입력하세요"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Textarea
                required
                placeholder="문의하실 내용을 상세히 적어주세요"
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
              <Button type="submit" className="w-full">
                등록하기
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {inquiries.map((iq) => (
          <Card key={iq.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{iq.title}</CardTitle>
              <Badge variant={iq.status === "answered" ? "default" : "outline"}>
                {iq.status === "answered" ? "답변완료" : "답변대기"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{iq.content}</p>
              {iq.reply_content && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-bold text-blue-600 mb-1">선생님 답변:</p>
                  <p className="text-sm text-blue-900 whitespace-pre-wrap">{iq.reply_content}</p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                작성일: {new Date(iq.created_at).toLocaleString("ko-KR")}
              </p>
            </CardContent>
          </Card>
        ))}
        {inquiries.length === 0 && (
          <p className="text-center text-gray-500 py-10">등록된 문의사항이 없습니다.</p>
        )}
      </div>
    </div>
  );
}