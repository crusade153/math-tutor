const curriculums = [
  {
    level: "초등",
    emoji: "🌱",
    badge: "초등 1~6학년",
    gradient: "linear-gradient(135deg, #00BFA5 0%, #00E676 100%)",
    checkColor: "#00C853",
    borderColor: "#00BFA5",
    topics: [
      "수와 연산 기초 다지기",
      "도형과 측정 개념",
      "분수·소수 완전 이해",
      "수학적 사고력 배양",
      "문장제 문제 풀이 훈련",
    ],
  },
  {
    level: "중등",
    emoji: "📘",
    badge: "중학교 1~3학년",
    gradient: "linear-gradient(135deg, #1E90FF 0%, #651FFF 100%)",
    checkColor: "#1E90FF",
    borderColor: "#1E90FF",
    featured: true,
    topics: [
      "방정식·부등식 완전 정복",
      "함수의 기초와 그래프",
      "확률과 통계",
      "도형과 좌표 평면",
      "수학 내신 집중 대비",
    ],
  },
  {
    level: "고등",
    emoji: "🎯",
    badge: "고등 1~3학년",
    gradient: "linear-gradient(135deg, #FF6D00 0%, #FFD600 100%)",
    checkColor: "#FF6D00",
    borderColor: "#FF6D00",
    topics: [
      "수능 수학 1·2 집중 대비",
      "미적분·확통·기하 전략",
      "수시·정시 맞춤 전략",
      "내신 단기간 상승 비법",
      "오답 분석 & 취약 단원 보완",
    ],
  },
];

export default function CurriculumCards() {
  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ background: "#F5F5F5" }}>
      <div className="max-w-5xl mx-auto">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            style={{ background: "#EBF5FF", color: "#1E90FF" }}
          >
            CURRICULUM
          </span>
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: "#222222" }}>
            수업 <span style={{ color: "#1E90FF" }}>과정</span>
          </h2>
          <p className="text-base" style={{ color: "#9E9E9E" }}>
            학년에 맞는 맞춤형 커리큘럼으로 체계적으로 수업합니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {curriculums.map((c) => (
            <div
              key={c.level}
              className="relative rounded-3xl bg-white overflow-hidden transition-all duration-300 hover:-translate-y-2"
              style={{
                boxShadow: c.featured
                  ? `0 8px 40px ${c.borderColor}30`
                  : "0 2px 16px rgba(0,0,0,0.07)",
                border: c.featured ? `2px solid ${c.borderColor}` : "1.5px solid #EEEEEE",
                outline: c.featured ? `3px solid ${c.borderColor}22` : "none",
                outlineOffset: "3px",
              }}
            >
              {/* 인기 배너 */}
              {c.featured && (
                <div
                  className="py-2 text-center text-xs font-extrabold text-white tracking-wide"
                  style={{ background: c.gradient }}
                >
                  ✨ 가장 인기 있는 과정
                </div>
              )}

              {/* 그라디언트 헤더 */}
              <div
                className="p-6 pb-5"
                style={{ background: c.gradient }}
              >
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white/90 text-xs font-bold mb-3"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  {c.badge}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{c.emoji}</span>
                  <h3 className="text-2xl font-black text-white">{c.level} 수학</h3>
                </div>
              </div>

              {/* 커리큘럼 목록 */}
              <div className="p-6 pt-5">
                <ul className="space-y-3">
                  {c.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-2.5 text-sm" style={{ color: "#444444" }}>
                      <span
                        className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: c.checkColor, minWidth: "16px" }}
                      >
                        ✓
                      </span>
                      {topic}
                    </li>
                  ))}
                </ul>

                {/* 상담 링크 */}
                <a
                  href="#consultation"
                  className="mt-6 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-80"
                  style={{ background: "#F5F5F5", color: c.checkColor }}
                >
                  상담 신청하기 →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
