"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { GRADE_OPTIONS } from "@/lib/utils";

export default function ConsultationForm() {
  const [form, setForm] = useState({ name: "", phone: "", grade: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("이름과 연락처는 필수입니다.");
      return;
    }
    setLoading(true);

    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSubmitted(true);
      toast.success("상담 신청이 완료되었습니다!");
    } else {
      const json = await res.json();
      toast.error(json.error ?? "신청 실패");
    }
    setLoading(false);
  }

  return (
    <section id="consultation" className="py-16 px-4 bg-blue-600">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">무료 상담 신청</h2>
          <p className="text-blue-100">연락처를 남겨주시면 빠르게 연락드리겠습니다.</p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              상담 신청이 완료되었습니다!
            </h3>
            <p className="text-gray-500">
              빠른 시일 내에 연락드리겠습니다.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", grade: "", message: "" }); }}
            >
              다시 신청하기
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>이름 *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="학부모님 성함"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>연락처 *</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="010-0000-0000"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>자녀 학년</Label>
              <Select value={form.grade} onValueChange={(v) => v !== null && setForm({ ...form, grade: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="학년 선택 (선택)" />
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
              <Label>문의 내용</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="궁금한 점이나 문의사항을 남겨주세요."
                rows={4}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-base font-semibold"
              disabled={loading}
            >
              {loading ? "신청 중..." : "무료 상담 신청하기 →"}
            </Button>
            <p className="text-xs text-gray-400 text-center">
              개인정보는 상담 목적으로만 사용되며 안전하게 보관됩니다.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
