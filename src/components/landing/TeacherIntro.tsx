export default function TeacherIntro() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">선생님 소개</h2>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-48 h-48 rounded-full bg-blue-100 flex items-center justify-center text-7xl shrink-0">
            👩‍🏫
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">수학 전문 과외 선생님</h3>
              <p className="text-blue-600 text-sm mt-1">10년 경력 · 수학교육학 전공</p>
            </div>
            <div className="space-y-2 text-gray-600 text-sm">
              <p>🎓 수학교육학과 졸업</p>
              <p>📋 중등 수학 정교사 2급 자격</p>
              <p>⏰ 10년 이상의 수학 과외 경력</p>
              <p>🏆 수능 만점 지도 경력 보유</p>
            </div>
            <blockquote className="border-l-4 border-blue-600 pl-4 italic text-gray-500 text-sm">
              &ldquo;수학은 외우는 것이 아니라 이해하는 것입니다. 개념을 탄탄히 하면 어떤 문제도 풀 수 있습니다.&rdquo;
            </blockquote>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-12 text-center">
          {[
            { value: "10년+", label: "지도 경력" },
            { value: "200명+", label: "누적 수강생" },
            { value: "95%", label: "목표 달성률" },
          ].map((stat) => (
            <div key={stat.label} className="p-5 rounded-xl bg-blue-50">
              <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
