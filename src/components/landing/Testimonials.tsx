const testimonials = [
  {
    name: "김○○ 학부모",
    child: "고등 2학년 딸",
    rating: 5,
    text: "수학을 포기했던 아이가 이제 수학을 즐겨 합니다. 공부방 환경이 집중하기 너무 좋고 선생님이 개념을 차근차근 설명해주셔서 성적이 많이 올랐어요.",
  },
  {
    name: "이○○ 학부모",
    child: "중학교 1학년 아들",
    rating: 5,
    text: "앱으로 출결 확인이 되니까 아이가 공부방에 잘 가고 있는지 실시간으로 알 수 있어서 너무 편해요. 진도만 나가는 게 아니라 아이 수준에 맞게 가르쳐주셔서 만족합니다.",
  },
  {
    name: "박○○ 학부모",
    child: "초등 5학년 딸",
    rating: 5,
    text: "공부방이 깨끗하고 조용해서 아이가 집중을 잘 해요. 수업 일지를 매번 보내주셔서 진도 파악이 쉽고, 선생님께 카톡으로 질문도 바로 할 수 있어 좋았습니다.",
  },
  {
    name: "최○○ 학부모",
    child: "고등 1학년 아들",
    rating: 5,
    text: "학원보다 훨씬 개인적인 수업이 가능해서 아이 성적이 빠르게 올랐어요. 중간·기말 시험 전에 집중적으로 내신 대비를 해주셔서 정말 감사했습니다.",
  },
  {
    name: "정○○ 학부모",
    child: "중학교 3학년 딸",
    rating: 5,
    text: "면담 예약도 앱으로 편하게 하고, 선생님이 아이 상황을 정말 잘 파악하고 계세요. 수학 때문에 스트레스받던 아이가 이제는 자신감이 생겼어요.",
  },
  {
    name: "한○○ 학부모",
    child: "초등 3학년 아들",
    rating: 5,
    text: "어린 아이인데도 선생님이 재미있게 가르쳐주셔서 수학을 좋아하게 됐어요. 공부방 위치도 집에서 가까워서 오가기 편하고 안전합니다.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-indigo-600 text-sm font-semibold tracking-widest uppercase mb-3">
            REVIEWS
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">수강 후기</h2>
          <p className="text-gray-500">학부모님들의 생생한 후기를 전합니다</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300"
            >
              {/* 별점 */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-700 text-sm leading-relaxed mb-5">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-base">
                  👩
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.child} 학부모</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
