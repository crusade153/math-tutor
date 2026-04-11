"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "비밀번호 변경 실패");
        return;
      }

      toast.success("비밀번호가 변경되었습니다.");
      const meRes = await fetch("/api/auth/me");
      const meJson = await meRes.json();
      const role = meJson.data?.role;
      router.push(role === "admin" ? "/admin/dashboard" : "/parent/dashboard");
    } catch {
      toast.error("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-500 to-indigo-600 px-4 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="text-2xl font-bold text-white">비밀번호 변경</h1>
        </div>

        <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20">
          {/* 안내 메시지 */}
          <div className="mb-5 p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 text-sm">
            초기 비밀번호를 변경해야 합니다. 8자 이상의 새 비밀번호를 설정해주세요.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/80 text-sm">현재 비밀번호</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-amber-400 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 text-sm">새 비밀번호</Label>
              <Input
                type="password"
                placeholder="8자 이상"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-amber-400 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 text-sm">새 비밀번호 확인</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-amber-400 h-11"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold text-base shadow-lg shadow-amber-500/30 hover:opacity-90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
