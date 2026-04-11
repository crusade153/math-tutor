import NoticesClient from "./NoticesClient";

export default function AdminNoticesPage() {
  // NoticesClient 내부에서 API를 통해 데이터를 직접 불러오므로,
  // 여기서는 아무런 Props(데이터)를 넘기지 않고 컴포넌트만 렌더링합니다.
  return <NoticesClient />;
}