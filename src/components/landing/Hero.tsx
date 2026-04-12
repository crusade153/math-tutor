import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1E90FF 0%, #0BC76A 100%)" }}
    >
      {/* 배경 광원 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #FFFFFF 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #FFFFFF 0%, transparent 70%)" }}
        />
        {/* 수학 기호 장식 */}
        <div className="absolute top-16 left-6 text-white/[0.07] text-[10rem] font-black select-none leading-none">π</div>
        <div className="absolute bottom-20 right-8 text-white/[0.07] text-[10rem] font-black select-none leading-none">∑</div>
        <div className="absolute top-1/3 right-1/4 text-white/[0.06] text-8xl font-black select-none">∫</div>
        <div className="absolute bottom-1/3 left-1/5 text-white/[0.06] text-8xl font-black select-none">√</div>
        <div className="absolute top-1/2 right-12 text-white/[0.05] text-6xl font-black select-none">△</div>
        <div className="absolute top-1/4 left-1/3 text-white/[0.05] text-5xl font-black select-none">×</div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-28 text-center">
        {/* 배지 */}
        <div
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-10"
          style={{
            background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.38)",
            backdropFilter: "blur(10px)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#FFD600", boxShadow: "0 0 8px #FFD600" }}
          />
          <span className="text-white text-sm font-semibold tracking-wide">
            현재 등록 가능 · 소수정예 운영 중
          </span>
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.15] mb-6">
          올바른 환경이
          <br />
          <span
            style={{
              color: "#FFD600",
              textShadow: "0 2px 20px rgba(255,214,0,0.4)",
            }}
          >
            수학을 바꿉니다
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/85 mb-3 max-w-2xl mx-auto leading-relaxed font-light">
          소음 없는 전용 공부방,{" "}
          <strong className="font-extrabold text-white">10년 경력 선생님</strong>의 1:1 맞춤 지도
        </p>
        <p className="text-base text-white/60 mb-14 tracking-wide">
          학부모 앱으로 출결·수업 내용을 실시간 확인하세요
        </p>

        {/* CTA 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#consultation">
            <button
              className="px-10 py-4 font-extrabold text-base rounded-full shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all duration-200 w-full sm:w-auto"
              style={{
                background: "#FFFFFF",
                color: "#1E90FF",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}
            >
              무료 상담 신청 →
            </button>
          </a>
          <Link href="/login">
            <button
              className="px-10 py-4 font-bold text-base text-white rounded-full hover:bg-white/20 active:bg-white/30 transition-all duration-200 w-full sm:w-auto"
              style={{
                border: "2px solid rgba(255,255,255,0.55)",
                backdropFilter: "blur(8px)",
              }}
            >
              학부모 로그인
            </button>
          </Link>
        </div>

        {/* 신뢰 지표 카드 */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {[
            { value: "10년+", label: "지도 경력" },
            { value: "200명+", label: "누적 수강생" },
            { value: "95%", label: "목표 달성률" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="py-5 px-3 rounded-2xl text-center"
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.28)",
                backdropFilter: "blur(10px)",
              }}
            >
              <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-white/65 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 웨이브 전환 → WhyUs(흰 배경)으로 */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="w-full h-16 block">
          <path
            d="M0,32 C240,64 480,0 720,32 C960,64 1200,0 1440,32 L1440,64 L0,64 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    </section>
  );
}
