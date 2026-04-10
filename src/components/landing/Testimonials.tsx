const testimonials = [
  {
    name: "김○○ 학부모",
    grade: "고등 2학년",
    rating: 5,
    text: "수학을 포기했던 아이가 이제 수학을 즐겨 합니다. 개념을 차근차근 설명해주셔서 정말 감사합니다.",
  },
  {
    name: "이○○ 학부모",
    grade: "중학교 1학년",
    rating: 5,
    text: "진도만 나가는 게 아니라 아이 수준에 맞게 설명해주시는 게 너무 좋았어요. 성적도 많이 올랐습니다.",
  },
  {
    name: "박○○ 학부모",
    grade: "초등 5학년",
    rating: 5,
    text: "아이가 선생님이랑 수업하는 걸 좋아해요. 수업 일지도 매번 보내주셔서 진도 파악이 쉬워요.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">수강 후기</h2>
          <p className="text-gray-500">학부모님들의 생생한 후기를 전합니다</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="text-amber-400 text-lg mb-3">
                {"★".repeat(t.rating)}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400">{t.grade} 학부모</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
