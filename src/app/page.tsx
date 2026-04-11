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
      <nav className="bg-violet-600/90 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <span className="font-bold text-white text-lg">수학 공부방</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <a
              href="#consultation"
              className="text-sm text-white/70 hover:text-white hidden md:block transition-colors"
            >
              상담 신청
            </a>
            <a
              href="#location"
              className="text-sm text-white/70 hover:text-white hidden md:block transition-colors"
            >
              오시는 길
            </a>
            <Link href="/login">
              <button className="text-sm bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">
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

      {/* 위치 섹션에 id 앵커 추가 */}
      <div id="location">
        <LocationSection />
      </div>

      <Testimonials />
      <ConsultationForm />

      {/* 푸터 */}
      <footer className="bg-gray-950 text-gray-400 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">📚</span>
              <span className="font-bold text-white">수학 공부방</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#consultation" className="hover:text-white transition-colors">상담 신청</a>
              <a href="#location" className="hover:text-white transition-colors">오시는 길</a>
              <Link href="/login" className="hover:text-white transition-colors">학부모 로그인</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between gap-2 text-sm">
            <p>문의: 010-0000-0000 · 카카오톡 오픈채팅</p>
            <p className="text-xs text-gray-600">© 2026 수학 공부방. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
