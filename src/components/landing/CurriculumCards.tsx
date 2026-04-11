const curriculums = [
  {
    level: "초등",
    emoji: "🌱",
    badge: "초등 1~6학년",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    topics: [
      "수와 연산 기초 다지기",
      "도형과 측정 개념",
      "분수·소수 완전 이해",
      "수학적 사고력 배양",
      "받아쓰기·문장제 문제 훈련",
    ],
  },
  {
    level: "중등",
    emoji: "📘",
    badge: "중학교 1~3학년",
    gradient: "from-indigo-500 to-purple-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
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
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
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
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-indigo-600 text-sm font-semibold tracking-widest uppercase mb-3">
            CURRICULUM
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">수업 과정</h2>
          <p className="text-gray-500">
            학년에 맞는 맞춤형 커리큘럼으로
            <br className="md:hidden" />
            체계적으로 수업합니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {curriculums.map((c) => (
            <div
              key={c.level}
              className={`relative rounded-3xl border-2 overflow-hidden ${c.border} bg-white shadow-sm hover:shadow-md transition-shadow duration-300 ${
                c.featured ? "ring-2 ring-indigo-400 ring-offset-2" : ""
              }`}
            >
              {c.featured && (
                <div className="absolute top-0 left-0 right-0 py-1.5 text-center text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600">
                  ✨ 가장 인기 있는 과정
                </div>
              )}
              <div className={`p-6 ${c.featured ? "pt-10" : ""}`}>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-bold bg-gradient-to-r ${c.gradient} mb-4`}
                >
                  {c.badge}
                </div>
                <div className="text-4xl mb-2">{c.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{c.level} 수학</h3>
                <ul className="space-y-2.5">
                  {c.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-2 text-gray-700 text-sm">
                      <span className="text-indigo-500 mt-0.5 shrink-0">✓</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
