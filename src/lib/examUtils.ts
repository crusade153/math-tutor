import type { ProblemEntry } from "@/types";

/**
 * 오답 문제 목록에서 취약 단원을 계산합니다.
 * 입력된 problems는 모두 오답 문제이므로 단원별 배점 합산 기준으로 내림차순 정렬합니다.
 * (구버전 호환: correct=true 문제는 집계에서 제외)
 */
export function computeWeakTopics(problems: ProblemEntry[]): string[] {
  if (!problems || problems.length === 0) return [];

  // 단원별 오답 배점 집계
  const topicMap = new Map<string, number>();

  for (const p of problems) {
    const topic = (p.topic ?? "").trim();
    if (!topic) continue;
    // correct가 명시적으로 true면 제외, 그 외(false 또는 undefined)는 오답으로 처리
    if (p.correct === true) continue;
    topicMap.set(topic, (topicMap.get(topic) ?? 0) + (p.points ?? 0));
  }

  // 오답 배점 내림차순 정렬
  return [...topicMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic);
}

/** Neon이 TEXT[]를 PostgreSQL 형식 문자열로 반환할 때 JS 배열로 변환 */
export function parseTextArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val as string[];
  if (typeof val === "string") {
    // PostgreSQL 형식: {item1,"item two"} → ['item1', 'item two']
    const inner = val.replace(/^\{|\}$/g, "");
    if (!inner) return [];
    return inner
      .split(",")
      .map((s) => s.replace(/^"|"$/g, "").trim())
      .filter(Boolean);
  }
  return [];
}

/** JSONB가 문자열로 반환된 경우를 안전하게 파싱 */
export function parseJsonb<T = unknown>(val: unknown): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val as T[];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

interface FeedbackParams {
  examName: string;
  score: number;
  maxScore: number;
  examDate: string;
  problems: ProblemEntry[];
  weakTopics: string[];
  fileUrl?: string | null;
  teacherComment?: string | null;
  studentName: string;
}

/**
 * 학부모에게 발송할 개인화 피드백 공지 내용을 생성합니다.
 */
export function buildFeedbackNoticeContent(params: FeedbackParams): {
  title: string;
  content: string;
} {
  const {
    examName,
    score,
    maxScore,
    examDate,
    problems,
    weakTopics,
    fileUrl,
    teacherComment,
    studentName,
  } = params;

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const formattedDate = examDate ? examDate.slice(0, 10) : "";

  // 오답 문제만 표시 (correct=true는 제외)
  const wrongProblems = problems.filter((p) => p.correct !== true);

  const problemLines = wrongProblems
    .map((p) => `  ${p.num}번 [${p.topic || "미분류"}] — ❌ 오답 (${p.points}점)`)
    .join("\n");

  const weakLine =
    weakTopics.length > 0
      ? `${weakTopics.join(", ")} 단원에서 추가 학습이 필요합니다.`
      : `특별한 약점 단원이 없습니다. 잘 하고 있어요! 🎉`;

  let content = `📊 ${examName} 성적 피드백\n\n`;
  content += `■ 점수: ${score}점 / ${maxScore}점 (${percentage}%)\n`;
  content += `■ 시험일: ${formattedDate}\n`;

  if (wrongProblems.length > 0) {
    content += `\n■ 틀린 문제 (${wrongProblems.length}개)\n${problemLines}\n`;
  }

  content += `\n■ 취약 단원\n  ${weakLine}\n`;

  if (fileUrl) {
    content += `\n■ 시험지 확인\n  ${fileUrl}\n`;
  }

  if (teacherComment) {
    content += `\n■ 선생님 코멘트\n  ${teacherComment}\n`;
  }

  content += `\n수고했습니다, ${studentName}! 궁금한 점은 선생님께 문의해 주세요.`;

  return {
    title: `[성적 피드백] ${examName}`,
    content,
  };
}
