const testimonials = [
  {
    name: "김○○ 학부모",
    child: "고등 2학년 딸",
    avatar: "👩",
    avatarBg: "#EBF5FF",
    text: "수학을 포기했던 아이가 이제 수학을 즐겨 합니다. 공부방 환경이 집중하기 너무 좋고 선생님이 개념을 차근차근 설명해주셔서 성적이 많이 올랐어요.",
  },
  {
    name: "이○○ 학부모",
    child: "중학교 1학년 아들",
    avatar: "👨",
    avatarBg: "#E8F9EF",
    text: "앱으로 출결 확인이 되니까 아이가 공부방에 잘 가고 있는지 실시간으로 알 수 있어서 너무 편해요. 아이 수준에 맞게 가르쳐주셔서 만족합니다.",
  },
  {
    name: "박○○ 학부모",
    child: "초등 5학년 딸",
    avatar: "👩",
    avatarBg: "#F0EAFF",
    text: "공부방이 깨끗하고 조용해서 아이가 집중을 잘 해요. 수업 일지를 매번 보내주셔서 진도 파악이 쉽고, 카톡으로 질문도 바로 할 수 있어 좋았습니다.",
  },
  {
    name: "최○○ 학부모",
    child: "고등 1학년 아들",
    avatar: "👨",
    avatarBg: "#FFF3E8",
    text: "학원보다 훨씬 개인적인 수업이 가능해서 아이 성적이 빠르게 올랐어요. 중간·기말 전에 집중적으로 내신 대비를 해주셔서 정말 감사했습니다.",
  },
  {
    name: "정○○ 학부모",
    child: "중학교 3학년 딸",
    avatar: "👩",
    avatarBg: "#E6F9F7",
    text: "면담 예약도 앱으로 편하게 하고, 선생님이 아이 상황을 정말 잘 파악하고 계세요. 수학 때문에 스트레스받던 아이가 이제는 자신감이 생겼어요.",
  },
  {
    name: "한○○ 학부모",
    child: "초등 3학년 아들",
    avatar: "👨",
    avatarBg: "#FFFBE6",
    text: "어린 아이인데도 선생님이 재미있게 가르쳐주셔서 수학을 좋아하게 됐어요. 공부방 위치도 집에서 가까워서 오가기 편하고 안전합니다.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ background: "#F5F5F5" }}>
      {/* 배경 장식 */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #1E90FF 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            style={{ background: "#EBF5FF", color: "#1E90FF" }}
          >
            REVIEWS
          </span>
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: "#222222" }}>
            수강 <span style={{ color: "#1E90FF" }}>후기</span>
          </h2>
          <p className="text-base" style={{ color: "#9E9E9E" }}>
            학부모님들의 생생한 후기를 전합니다
          </p>

          {/* 별점 요약 */}
          <div className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full bg-white"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="#FFD600">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="font-bold text-sm" style={{ color: "#222222" }}>5.0</span>
            <span className="text-sm" style={{ color: "#9E9E9E" }}>· 6개의 후기</span>
          </div>
        </div>

        {/* 후기 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-6 rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
              style={{
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                border: "1.5px solid #F0F0F0",
              }}
            >
              {/* 큰 따옴표 */}
              <div
                className="text-5xl font-black leading-none mb-2 -mt-1"
                style={{ color: "#1E90FF", opacity: 0.2 }}
              >
                "
              </div>

              {/* 별점 */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="#FFD600">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* 후기 본문 */}
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#555555" }}>
                {t.text}
              </p>

              {/* 작성자 */}
              <div
                className="flex items-center gap-3 pt-4"
                style={{ borderTop: "1px solid #F5F5F5" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ background: t.avatarBg }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#222222" }}>{t.name}</p>
                  <p className="text-xs" style={{ color: "#9E9E9E" }}>{t.child} 학부모</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 웨이브 전환 → ConsultationForm(블루 배경)으로 */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="w-full h-16 block">
          <path
            d="M0,16 C360,64 1080,0 1440,48 L1440,64 L0,64 Z"
            fill="#1E90FF"
          />
        </svg>
      </div>
    </section>
  );
}
