export default function TeacherIntro() {
  return (
    <section
      className="relative pt-10 pb-28 px-4 overflow-hidden"
      style={{ background: "#1E90FF" }}
    >
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #FFFFFF, transparent)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #00C853, transparent)" }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* 섹션 헤더 */}
        <div className="text-center mb-14">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            style={{ background: "rgba(255,255,255,0.2)", color: "#FFD600" }}
          >
            ABOUT TEACHER
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            선생님 소개
          </h2>
          <p className="text-white/70 text-base">
            10년 이상 수학만 가르쳐 온 전문 선생님이 직접 지도합니다
          </p>
        </div>

        {/* 본문 카드 */}
        <div
          className="rounded-3xl p-8 md:p-10"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex flex-col md:flex-row items-start gap-10">
            {/* 프로필 영역 */}
            <div className="shrink-0 flex flex-col items-center gap-4 md:w-48">
              <div
                className="w-36 h-36 rounded-2xl flex items-center justify-center text-7xl shadow-xl"
                style={{
                  background: "linear-gradient(135deg, #FFFFFF20, #FFFFFF40)",
                  border: "2px solid rgba(255,255,255,0.4)",
                }}
              >
                👩‍🏫
              </div>
              <div className="text-center">
                <p className="font-black text-white text-lg">수학 전문 선생님</p>
                <p className="text-white/60 text-sm mt-1">수학과 전공 · 정교사 2급</p>
              </div>
              {/* 경력 배지 */}
              <div
                className="px-5 py-2 rounded-full text-sm font-bold"
                style={{ background: "#FFD600", color: "#222222" }}
              >
                ⭐ 10년+ 경력
              </div>
            </div>

            {/* 자격 & 철학 */}
            <div className="flex-1 space-y-6">
              {/* 자격 그리드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: "🎓", text: "수학과 졸업" },
                  { icon: "📋", text: "중등 수학 정교사 2급 자격" },
                  { icon: "⏰", text: "10년 이상 수학 지도 경력" },
                  { icon: "🎯", text: "상·중·하 수준별 맞춤 지도 실현" },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 hover:bg-white/10"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium text-white">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* 인용구 */}
              <div
                className="relative p-5 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  borderLeft: "4px solid #FFD600",
                }}
              >
                <span
                  className="absolute -top-3 left-4 text-5xl font-black leading-none"
                  style={{ color: "#FFD600", opacity: 0.5 }}
                >
                  "
                </span>
                <p className="text-white/80 text-sm leading-relaxed italic pt-3">
                  수학은 외우는 것이 아니라 이해하는 것입니다. 각 학생의 속도와 수준에 맞게
                  개념을 탄탄히 잡아, 어떤 문제도 스스로 풀 수 있는 힘을 길러드립니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 통계 카드 행 */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { value: "10년+", label: "지도 경력", icon: "📅" },
            { value: "200명+", label: "누적 수강생", icon: "👨‍👩‍👧‍👦" },
            { value: "95%", label: "목표 달성률", icon: "🎯" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded-2xl text-center"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="text-3xl font-black text-white">{stat.value}</p>
              <p className="text-white/60 text-xs mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 웨이브 전환 → CurriculumCards(연한 회색 배경)으로 */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="w-full h-16 block">
          <path
            d="M0,48 C480,0 960,64 1440,16 L1440,64 L0,64 Z"
            fill="#F5F5F5"
          />
        </svg>
      </div>
    </section>
  );
}
