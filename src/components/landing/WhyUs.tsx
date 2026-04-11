const features = [
  {
    icon: "🏠",
    title: "전용 학습 공간",
    desc: "가정처럼 편안하고 학교처럼 집중할 수 있는 전용 공부방을 제공합니다. 책상·조명·교재 모두 완비.",
  },
  {
    icon: "📱",
    title: "학부모 앱 실시간 알림",
    desc: "출결 현황, 수업 내용, 숙제까지 앱으로 바로 확인하세요. 언제 어디서나 아이의 학습을 모니터링.",
  },
  {
    icon: "👩‍🏫",
    title: "1:1 맞춤 수업",
    desc: "아이의 수준과 속도에 맞춰 개념부터 심화까지. 이해가 될 때까지 반복 설명하는 정교한 수업.",
  },
  {
    icon: "📊",
    title: "성적 분석 & 피드백",
    desc: "매달 성적 변화를 분석하고 취약 단원을 집중 보완합니다. 수능·내신 모두 체계적으로 대비.",
  },
  {
    icon: "🔒",
    title: "안전한 환경",
    desc: "CCTV 설치, 출입 관리로 학부모님이 안심할 수 있는 안전한 학습 환경을 제공합니다.",
  },
  {
    icon: "💬",
    title: "선생님과 직접 소통",
    desc: "카카오톡으로 언제든 질문·상담 가능. 아이 변화가 보이면 바로 알려드립니다.",
  },
];

export default function WhyUs() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-violet-600 via-purple-500 to-indigo-600 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">
            왜 우리 공부방인가요?
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            학부모님이 선택하는 이유
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            아이를 위한 최선을 고민하는 학부모님의 마음으로,
            <br className="hidden md:block" />
            처음부터 끝까지 책임지는 공부방을 만들었습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
