// 공부방 위치 정보 - 아래 상수들을 실제 정보로 변경하세요
const LOCATION = {
  name: "수학 공부방",
  address: "전북 군산시 동수송3길 17",
  detail: "",
  phone: "010-0000-0000",
  hours: "평일 14:00 ~ 21:00 · 토요일 10:00 ~ 18:00",
  naverMapUrl: "https://naver.me/FriKXukE",
  // 네이버 지도 임베드 URL (선택사항: 네이버 지도 API 사용 시 활성화)
  // embedUrl: "https://map.naver.com/v5/?c=...",
};

export default function LocationSection() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-indigo-600 text-sm font-semibold tracking-widest uppercase mb-3">
            LOCATION
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">오시는 길</h2>
          <p className="text-gray-500">안전하고 깨끗한 전용 공부방 공간에서 수업합니다</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* 지도 영역 */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg bg-white border border-gray-100 aspect-[4/3]">
            {/* 네이버 지도 임베드 - 실제 사용 시 아래 iframe의 src를 네이버 지도 공유 URL로 변경하세요 */}
            <iframe
              src={`https://map.naver.com/v5/search/${encodeURIComponent(LOCATION.address)}`}
              className="w-full h-full"
              title="공부방 위치"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* iframe이 로드되지 않을 경우 보여지는 배경 */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center gap-4">
              <div className="text-6xl">🗺️</div>
              <p className="text-gray-400 text-sm">지도를 불러오는 중...</p>
            </div>
          </div>

          {/* 위치 정보 */}
          <div className="space-y-5">
            {/* 주소 카드 */}
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📍</span>
                {LOCATION.name}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 shrink-0 mt-0.5">주소</span>
                  <div>
                    <p className="text-gray-800 font-medium">{LOCATION.address}</p>
                    {LOCATION.detail && <p className="text-gray-500">{LOCATION.detail}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 shrink-0">전화</span>
                  <a
                    href={`tel:${LOCATION.phone.replace(/-/g, "")}`}
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    {LOCATION.phone}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 shrink-0 mt-0.5">운영</span>
                  <p className="text-gray-700">{LOCATION.hours}</p>
                </div>
              </div>
            </div>

            {/* 특징 */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "🅿️", text: "주차 가능" },
                { icon: "🚇", text: "지하철 도보 5분" },
                { icon: "📷", text: "CCTV 설치" },
                { icon: "❄️", text: "냉난방 완비" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 text-sm text-gray-700"
                >
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            {/* 네이버 지도 링크 버튼 */}
            <a
              href={LOCATION.naverMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              네이버 지도에서 보기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
