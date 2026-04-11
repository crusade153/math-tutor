"use client";

import { useState } from "react";
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
    <section
      id="consultation"
      className="py-20 px-4 bg-gradient-to-br from-violet-600 via-purple-500 to-indigo-600 relative overflow-hidden"
    >
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">
            FREE CONSULTATION
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">무료 상담 신청</h2>
          <p className="text-white/60">
            연락처를 남겨주시면 24시간 내에 빠르게 연락드리겠습니다.
          </p>
        </div>

        {submitted ? (
          <div className="p-10 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
            <div className="text-6xl mb-5">✅</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              상담 신청이 완료되었습니다!
            </h3>
            <p className="text-white/60 mb-6">
              빠른 시일 내에 연락드리겠습니다.
            </p>
            <button
              className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
              onClick={() => {
                setSubmitted(false);
                setForm({ name: "", phone: "", grade: "", message: "" });
              }}
            >
              다시 신청하기
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 md:p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/80 text-sm">이름 *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="학부모님 성함"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-amber-400 focus:ring-amber-400/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 text-sm">연락처 *</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="010-0000-0000"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-amber-400 focus:ring-amber-400/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 text-sm">자녀 학년</Label>
              <Select
                value={form.grade}
                onValueChange={(v) => v !== null && setForm({ ...form, grade: v })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white [&>span]:text-white/70">
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

            <div className="space-y-2">
              <Label className="text-white/80 text-sm">문의 내용</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="궁금한 점이나 수업에 대해 알고 싶은 내용을 남겨주세요."
                rows={4}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-amber-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold text-base shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "신청 중..." : "무료 상담 신청하기 →"}
            </button>

            <p className="text-xs text-white/40 text-center">
              개인정보는 상담 목적으로만 사용되며 안전하게 보관됩니다.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
