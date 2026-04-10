import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4 overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-9xl font-bold text-white select-none">π</div>
        <div className="absolute bottom-10 right-10 text-9xl font-bold text-white select-none">∑</div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="text-5xl mb-4">📐</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          수학, 제대로 이해하는
          <br />
          <span className="text-amber-300">1:1 맞춤 과외</span>
        </h1>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          초등부터 고등까지, 개념 중심의 수학 교육으로
          <br />
          자신감 있는 수학 실력을 만들어 드립니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#consultation">
            <Button
              size="lg"
              className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-8"
            >
              무료 상담 신청 →
            </Button>
          </a>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              학부모 로그인
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
