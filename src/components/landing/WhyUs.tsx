"use client";

const features = [
  {
    icon: "🏠",
    title: "전용 학습 공간",
    desc: "가정처럼 편안하고 학교처럼 집중할 수 있는 전용 공부방. 책상·조명·교재 모두 완비되어 있습니다.",
    accent: "#1E90FF",
    bg: "#EBF5FF",
  },
  {
    icon: "📱",
    title: "학부모 앱 실시간 알림",
    desc: "출결 현황, 수업 내용, 숙제까지 앱으로 즉시 확인. 어디서나 아이의 학습을 모니터링하세요.",
    accent: "#00C853",
    bg: "#E8F9EF",
  },
  {
    icon: "👩‍🏫",
    title: "1:1 맞춤 수업",
    desc: "아이의 수준과 속도에 맞춰 개념부터 심화까지. 이해가 될 때까지 반복 설명하는 정교한 수업.",
    accent: "#651FFF",
    bg: "#F0EAFF",
  },
  {
    icon: "📊",
    title: "성적 분석 & 피드백",
    desc: "매달 성적 변화를 분석하고 취약 단원을 집중 보완합니다. 수능·내신 모두 체계적으로 대비.",
    accent: "#FF6D00",
    bg: "#FFF3E8",
  },
  {
    icon: "🔒",
    title: "안전한 환경",
    desc: "CCTV 설치, 출입 관리로 학부모님이 안심할 수 있는 안전한 학습 환경을 제공합니다.",
    accent: "#00BFA5",
    bg: "#E6F9F7",
  },
  {
    icon: "💬",
    title: "선생님과 직접 소통",
    desc: "카카오톡으로 언제든 질문·상담 가능. 아이 변화가 보이면 바로 알려드립니다.",
    accent: "#FFD600",
    bg: "#FFFBE6",
  },
];

export default function WhyUs() {
  return (
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      {/* 배경 패턴 */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #1E90FF 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            style={{ background: "#EBF5FF", color: "#1E90FF" }}
          >
            왜 우리 공부방인가요?
          </span>
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: "#222222" }}>
            학부모님이{" "}
            <span style={{ color: "#1E90FF" }}>선택하는 이유</span>
          </h2>
          <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: "#9E9E9E" }}>
            아이를 위한 최선을 고민하는 학부모님의 마음으로,
            <br className="hidden md:block" />
            처음부터 끝까지 책임지는 공부방을 만들었습니다.
          </p>
        </div>

        {/* 기능 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1.5 cursor-default"
              style={{
                border: "1.5px solid #F0F0F0",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = f.accent + "55";
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${f.accent}18`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#F0F0F0";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
              }}
            >
              {/* 아이콘 */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: f.bg }}
              >
                {f.icon}
              </div>

              {/* 텍스트 */}
              <h3 className="font-bold text-lg mb-2" style={{ color: "#222222" }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#666666" }}>
                {f.desc}
              </p>

              {/* 하단 액센트 바 */}
              <div
                className="mt-5 h-0.5 rounded-full transition-all duration-300 group-hover:w-full"
                style={{
                  background: `linear-gradient(90deg, ${f.accent}, transparent)`,
                  width: "32px",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 웨이브 전환 → TeacherIntro(블루 배경)으로 */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="w-full h-16 block">
          <path
            d="M0,0 C360,64 1080,0 1440,48 L1440,64 L0,64 Z"
            fill="#1E90FF"
          />
        </svg>
      </div>
    </section>
  );
}
