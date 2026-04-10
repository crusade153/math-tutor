const curriculums = [
  {
    level: "초등",
    emoji: "🌱",
    color: "bg-green-50 border-green-200",
    titleColor: "text-green-700",
    topics: ["수와 연산 기초", "도형과 측정", "분수·소수 개념", "수학적 사고력 배양"],
  },
  {
    level: "중등",
    emoji: "📘",
    color: "bg-blue-50 border-blue-200",
    titleColor: "text-blue-700",
    topics: ["방정식·부등식", "함수의 기초", "확률과 통계", "도형과 좌표"],
  },
  {
    level: "고등",
    emoji: "🎯",
    color: "bg-amber-50 border-amber-200",
    titleColor: "text-amber-700",
    topics: ["수능 수학 대비", "미적분·확통·기하", "수시·정시 전략", "내신 집중 관리"],
  },
];

export default function CurriculumCards() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">수업 과정</h2>
          <p className="text-gray-500">학년에 맞는 맞춤형 커리큘럼으로 수업합니다</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {curriculums.map((c) => (
            <div
              key={c.level}
              className={`rounded-xl border-2 p-6 ${c.color}`}
            >
              <div className="text-4xl mb-3">{c.emoji}</div>
              <h3 className={`text-xl font-bold mb-4 ${c.titleColor}`}>
                {c.level} 수학
              </h3>
              <ul className="space-y-2">
                {c.topics.map((topic) => (
                  <li key={topic} className="flex items-center gap-2 text-gray-700 text-sm">
                    <span className="text-gray-400">✓</span>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
