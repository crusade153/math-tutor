import Hero from "@/components/landing/Hero";
import TeacherIntro from "@/components/landing/TeacherIntro";
import CurriculumCards from "@/components/landing/CurriculumCards";
import Testimonials from "@/components/landing/Testimonials";
import ConsultationForm from "@/components/landing/ConsultationForm";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* 헤더 네비게이션 */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📐</span>
            <span className="font-bold text-blue-600">수학 과외</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#consultation" className="text-sm text-gray-600 hover:text-blue-600 hidden md:block">
              상담 신청
            </a>
            <Link href="/login">
              <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                로그인
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <Hero />
      <TeacherIntro />
      <CurriculumCards />
      <Testimonials />
      <ConsultationForm />

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p className="mb-1">📐 수학 전문 과외</p>
        <p>문의: 010-0000-0000 · 카카오톡 오픈채팅</p>
        <p className="mt-3 text-xs text-gray-600">© 2024 수학 과외. All rights reserved.</p>
      </footer>
    </div>
  );
}
