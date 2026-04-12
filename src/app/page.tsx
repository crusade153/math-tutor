import Hero from "@/components/landing/Hero";
import WhyUs from "@/components/landing/WhyUs";
import TeacherIntro from "@/components/landing/TeacherIntro";
import CurriculumCards from "@/components/landing/CurriculumCards";
import LocationSection from "@/components/landing/LocationSection";
import Testimonials from "@/components/landing/Testimonials";
import ConsultationForm from "@/components/landing/ConsultationForm";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* 헤더 네비게이션 */}
      <nav
        className="sticky top-0 z-50 bg-white"
        style={{ boxShadow: "0 1px 16px rgba(0,0,0,0.08)" }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black text-white"
              style={{ background: "linear-gradient(135deg, #1E90FF, #00C853)" }}
            >
              π
            </div>
            <span className="font-black text-lg" style={{ color: "#1E90FF" }}>
              수학 공부방
            </span>
          </div>

          {/* 메뉴 */}
          <div className="flex items-center gap-2 md:gap-5">
            <a
              href="#consultation"
              className="text-sm font-medium hidden md:block transition-colors hover:text-[#1E90FF]"
              style={{ color: "#9E9E9E" }}
            >
              상담 신청
            </a>
            <a
              href="#location"
              className="text-sm font-medium hidden md:block transition-colors hover:text-[#1E90FF]"
              style={{ color: "#9E9E9E" }}
            >
              오시는 길
            </a>
            <Link href="/login">
              <button
                className="text-sm font-extrabold px-5 py-2.5 rounded-full text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #1E90FF, #00C853)",
                  boxShadow: "0 4px 12px rgba(30,144,255,0.35)",
                }}
              >
                학부모 로그인
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <Hero />
      <WhyUs />
      <TeacherIntro />
      <CurriculumCards />

      <div id="location">
        <LocationSection />
      </div>

      <Testimonials />
      <ConsultationForm />

      {/* 푸터 */}
      <footer style={{ background: "#111827" }} className="text-gray-400 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            {/* 푸터 로고 */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black text-white"
                style={{ background: "linear-gradient(135deg, #1E90FF, #00C853)" }}
              >
                π
              </div>
              <span className="font-black text-lg text-white">수학 공부방</span>
            </div>

            {/* 푸터 링크 */}
            <div className="flex items-center gap-6 text-sm">
              <a href="#consultation" className="hover:text-white transition-colors">상담 신청</a>
              <a href="#location" className="hover:text-white transition-colors">오시는 길</a>
              <Link href="/login" className="hover:text-white transition-colors">학부모 로그인</Link>
            </div>
          </div>

          {/* 구분선 */}
          <div
            className="border-t mb-6"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          />

          <div className="flex flex-col md:flex-row justify-between gap-2 text-sm">
            <p className="text-gray-400">문의: 010-0000-0000 · 카카오톡 오픈채팅</p>
            <p className="text-xs text-gray-600">© 2026 수학 공부방. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
