export default function TeacherIntro() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-indigo-600 text-sm font-semibold tracking-widest uppercase mb-3">
            ABOUT TEACHER
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">선생님 소개</h2>
          <p className="text-gray-500">10년 이상 수학만 가르쳐 온 전문 선생님이 직접 지도합니다</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* 프로필 이미지 */}
          <div className="relative shrink-0">
            <div className="w-52 h-52 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-8xl shadow-lg">
              👩‍🏫
            </div>
            <div className="absolute -bottom-3 -right-3 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg">
              10년+ 경력
            </div>
          </div>

          {/* 소개 내용 */}
          <div className="flex-1 space-y-5">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">수학 전문 공부방 선생님</h3>
              <p className="text-indigo-600 text-sm mt-1 font-medium">수학교육학 전공 · 정교사 2급</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: "🎓", text: "수학교육학과 졸업" },
                { icon: "📋", text: "중등 수학 정교사 2급 자격" },
                { icon: "⏰", text: "10년 이상 수학 지도 경력" },
                { icon: "🏆", text: "수능 만점 지도 경력 보유" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm text-gray-700 font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            <blockquote className="border-l-4 border-indigo-500 pl-4 py-2">
              <p className="italic text-gray-500 text-sm leading-relaxed">
                &ldquo;수학은 외우는 것이 아니라 이해하는 것입니다. 우리 공부방에서는
                개념을 탄탄히 잡아 어떤 문제도 스스로 풀 수 있는 힘을 길러드립니다.&rdquo;
              </p>
            </blockquote>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-6 mt-14">
          {[
            { value: "10년+", label: "지도 경력", icon: "📅" },
            { value: "200명+", label: "누적 수강생", icon: "👨‍👩‍👧‍👦" },
            { value: "95%", label: "목표 달성률", icon: "🎯" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 text-center"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="text-3xl font-extrabold text-indigo-700">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
