import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-500 via-purple-400 to-indigo-500">
      {/* 밝은 배경 광원 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/5 blur-3xl" />
        {/* 수학 기호 장식 */}
        <div className="absolute top-16 left-8 text-white/8 text-8xl font-bold select-none">π</div>
        <div className="absolute bottom-20 right-12 text-white/8 text-8xl font-bold select-none">∑</div>
        <div className="absolute top-1/3 right-1/4 text-white/8 text-6xl font-bold select-none">∫</div>
        <div className="absolute bottom-1/3 left-1/4 text-white/8 text-6xl font-bold select-none">√</div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-24 text-center">
        {/* 배지 */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-10 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shadow-emerald-300/50 shadow-sm" />
          현재 등록 가능 · 소수정예 운영 중
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-sm">
          올바른 환경이
          <br />
          <span className="text-yellow-200 drop-shadow-md">
            수학을 바꿉니다
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/85 mb-3 max-w-2xl mx-auto leading-relaxed font-light">
          소음 없는 전용 공부방, 10년 경력 선생님의 1:1 맞춤 지도
        </p>
        <p className="text-sm text-white/60 mb-12 tracking-wide">
          학부모 앱으로 출결·수업 내용을 실시간 확인하세요
        </p>

        {/* CTA 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#consultation">
            <button className="px-9 py-4 bg-white text-violet-700 font-bold text-base rounded-2xl shadow-xl shadow-black/20 hover:bg-yellow-50 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto">
              무료 상담 신청 →
            </button>
          </a>
          <Link href="/login">
            <button className="px-9 py-4 bg-white/15 backdrop-blur-sm border border-white/40 text-white font-semibold text-base rounded-2xl hover:bg-white/25 transition-all duration-300 w-full sm:w-auto">
              학부모 로그인
            </button>
          </Link>
        </div>

        {/* 신뢰 지표 */}
        <div className="mt-16 grid grid-cols-3 gap-5 max-w-lg mx-auto">
          {[
            { value: "10년+", label: "지도 경력" },
            { value: "200명+", label: "누적 수강생" },
            { value: "95%", label: "목표 달성률" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-md"
            >
              <p className="text-2xl font-extrabold text-white">{stat.value}</p>
              <p className="text-xs text-white/70 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 아래 화살표 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
