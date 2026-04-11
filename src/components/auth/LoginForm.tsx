"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "로그인 실패");
        return;
      }

      const { role, mustChangePw } = json.data;

      if (mustChangePw) {
        router.push("/change-password");
        return;
      }

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
        <div className="absolute top-16 left-8 text-white/5 text-8xl font-bold select-none">π</div>
        <div className="absolute bottom-16 right-8 text-white/5 text-8xl font-bold select-none">∑</div>
      </div>

      <div className="relative w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📚</div>
          <h1 className="text-2xl font-bold text-white">수학 공부방</h1>
          <p className="text-white/50 text-sm mt-1">학부모 전용 로그인</p>
        </div>

        {/* 로그인 카드 */}
        <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-white/80 text-sm">아이디</Label>
              <Input
                type="text"
                placeholder="아이디 입력"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-amber-400 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 text-sm">비밀번호</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-amber-400 h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold text-base shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <p className="text-center text-white/40 text-xs mt-6">
            선생님께서 안내한 계정 정보로 로그인하세요
          </p>
        </div>

        {/* 홈으로 */}
        <div className="text-center mt-6">
          <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors">
            ← 공부방 홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
