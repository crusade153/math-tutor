"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatKST, gradeLabel } from "@/lib/utils";

interface Inquiry {
  id: number;
  name: string;
  phone: string;
  grade: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  new: { label: "신규", color: "bg-red-100 text-red-600" },
  contacted: { label: "연락완료", color: "bg-amber-100 text-amber-700" },
  enrolled: { label: "등록", color: "bg-green-100 text-green-700" },
  declined: { label: "미등록", color: "bg-gray-100 text-gray-500" },
};

export default function InquiriesClient({ inquiries: initialInquiries }: { inquiries: Inquiry[] }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("상태가 변경되었습니다.");
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    }
  }

  const newCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">상담 문의</h1>
        {newCount > 0 && (
          <Badge className="bg-red-500 text-white">{newCount}건 신규</Badge>
        )}
      </div>

      {inquiries.length === 0 ? (
        <p className="text-center text-gray-400 py-8">접수된 상담 문의가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {inquiries.map((i) => {
            const st = STATUS_MAP[i.status] ?? STATUS_MAP.new;
            return (
              <Card key={i.id} className={i.status === "new" ? "border-red-200" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-xs ${st.color}`} variant="outline">{st.label}</Badge>
                        <span className="font-semibold">{i.name}</span>
                        <span className="text-sm text-gray-500">{i.phone}</span>
                        {i.grade && (
                          <span className="text-xs text-gray-400">{gradeLabel(i.grade)}</span>
                        )}
                      </div>
                      {i.message && (
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{i.message}</p>
                      )}
                      <p className="text-xs text-gray-300 mt-1">
                        {formatKST(i.created_at)}
                      </p>
                    </div>
                    <div className="shrink-0 w-32">
                      <Select value={i.status} onValueChange={(v) => v !== null && updateStatus(i.id, v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_MAP).map(([v, { label }]) => (
                            <SelectItem key={v} value={v}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
