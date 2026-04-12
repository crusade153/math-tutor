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
      className="relative pt-10 pb-20 px-4 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1E90FF 0%, #0BC76A 100%)" }}
    >
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #FFFFFF, transparent)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #FFD600, transparent)" }}
        />
        <div className="absolute top-16 left-8 text-white/[0.05] text-8xl font-black select-none">✏️</div>
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* 섹션 헤더 */}
        <div className="text-center mb-10">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            style={{ background: "rgba(255,255,255,0.2)", color: "#FFD600" }}
          >
            FREE CONSULTATION
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            무료 상담 신청
          </h2>
          <p className="text-white/70 text-base">
            연락처를 남겨주시면 24시간 내에 빠르게 연락드리겠습니다.
          </p>
        </div>

        {submitted ? (
          /* 완료 화면 */
          <div
            className="p-10 rounded-3xl text-center"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="text-6xl mb-5">✅</div>
            <h3 className="text-2xl font-black text-white mb-3">
              상담 신청이 완료되었습니다!
            </h3>
            <p className="text-white/65 mb-6">
              빠른 시일 내에 연락드리겠습니다.
            </p>
            <button
              className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:bg-white/20"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
              onClick={() => {
                setSubmitted(false);
                setForm({ name: "", phone: "", grade: "", message: "" });
              }}
            >
              다시 신청하기
            </button>
          </div>
        ) : (
          /* 폼 */
          <form
            onSubmit={handleSubmit}
            className="p-6 md:p-8 rounded-3xl space-y-5"
            style={{
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.28)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/85 text-sm font-semibold">이름 *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="학부모님 성함"
                  required
                  className="bg-white/10 border-white/25 text-white placeholder:text-white/35 focus:border-white/60 focus:bg-white/15"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/85 text-sm font-semibold">연락처 *</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="010-0000-0000"
                  required
                  className="bg-white/10 border-white/25 text-white placeholder:text-white/35 focus:border-white/60 focus:bg-white/15"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/85 text-sm font-semibold">자녀 학년</Label>
              <Select
                value={form.grade}
                onValueChange={(v) => v !== null && setForm({ ...form, grade: v })}
              >
                <SelectTrigger className="bg-white/10 border-white/25 text-white [&>span]:text-white/60">
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
              <Label className="text-white/85 text-sm font-semibold">문의 내용</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="궁금한 점이나 수업에 대해 알고 싶은 내용을 남겨주세요."
                rows={4}
                className="bg-white/10 border-white/25 text-white placeholder:text-white/35 focus:border-white/60 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-extrabold text-base transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: "#FFD600",
                color: "#222222",
                boxShadow: "0 4px 20px rgba(255,214,0,0.4)",
              }}
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
