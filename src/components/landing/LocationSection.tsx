// 공부방 위치 정보 - 아래 상수들을 실제 정보로 변경하세요
const LOCATION = {
  name: "수학 공부방",
  address: "전북 군산시 동수송3길 17",
  detail: "",
  phone: "010-0000-0000",
  hours: "평일 14:00 ~ 21:00 · 토요일 10:00 ~ 18:00",
  naverMapUrl: "https://naver.me/FriKXukE",
};

const amenities = [
  { icon: "🅿️", text: "주차 가능" },
  { icon: "🚇", text: "대중교통 접근 편리" },
  { icon: "📷", text: "CCTV 설치" },
  { icon: "❄️", text: "냉난방 완비" },
];

export default function LocationSection() {
  return (
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #1E90FF, transparent)" }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            style={{ background: "#EBF5FF", color: "#1E90FF" }}
          >
            LOCATION
          </span>
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: "#222222" }}>
            오시는 <span style={{ color: "#1E90FF" }}>길</span>
          </h2>
          <p className="text-base" style={{ color: "#9E9E9E" }}>
            안전하고 깨끗한 전용 공부방 공간에서 수업합니다
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* 지도 영역 */}
          <div
            className="relative rounded-3xl overflow-hidden aspect-[4/3]"
            style={{ boxShadow: "0 4px 24px rgba(30,144,255,0.15)", border: "2px solid #EBF5FF" }}
          >
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(LOCATION.address)}&output=embed&hl=ko&z=16`}
              className="w-full h-full"
              title="공부방 위치"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div
              className="absolute inset-0 -z-10 flex flex-col items-center justify-center gap-4"
              style={{ background: "linear-gradient(135deg, #EBF5FF, #E8F9EF)" }}
            >
              <div className="text-6xl">🗺️</div>
              <p className="text-sm" style={{ color: "#9E9E9E" }}>지도를 불러오는 중...</p>
            </div>
          </div>

          {/* 위치 정보 */}
          <div className="space-y-4">
            {/* 주소 카드 */}
            <div
              className="p-6 rounded-2xl bg-white"
              style={{
                border: "1.5px solid #EEF4FF",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <h3
                className="font-bold text-lg mb-5 flex items-center gap-2"
                style={{ color: "#222222" }}
              >
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: "#EBF5FF" }}
                >
                  📍
                </span>
                {LOCATION.name}
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-4">
                  <span
                    className="shrink-0 px-2 py-0.5 rounded text-xs font-bold mt-0.5"
                    style={{ background: "#F5F5F5", color: "#9E9E9E" }}
                  >
                    주소
                  </span>
                  <div>
                    <p className="font-semibold" style={{ color: "#222222" }}>{LOCATION.address}</p>
                    {LOCATION.detail && <p style={{ color: "#9E9E9E" }}>{LOCATION.detail}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="shrink-0 px-2 py-0.5 rounded text-xs font-bold"
                    style={{ background: "#F5F5F5", color: "#9E9E9E" }}
                  >
                    전화
                  </span>
                  <a
                    href={`tel:${LOCATION.phone.replace(/-/g, "")}`}
                    className="font-bold hover:underline"
                    style={{ color: "#1E90FF" }}
                  >
                    {LOCATION.phone}
                  </a>
                </div>
                <div className="flex items-start gap-4">
                  <span
                    className="shrink-0 px-2 py-0.5 rounded text-xs font-bold mt-0.5"
                    style={{ background: "#F5F5F5", color: "#9E9E9E" }}
                  >
                    운영
                  </span>
                  <p style={{ color: "#444444" }}>{LOCATION.hours}</p>
                </div>
              </div>
            </div>

            {/* 편의 시설 */}
            <div className="grid grid-cols-2 gap-3">
              {amenities.map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 p-3.5 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "#EBF5FF",
                    color: "#0050CC",
                  }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* 네이버 지도 버튼 */}
            <a
              href={LOCATION.naverMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-extrabold text-base text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #00C853, #00E676)",
                boxShadow: "0 4px 20px rgba(0,200,83,0.35)",
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              네이버 지도에서 보기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
