"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface Score {
  exam_name: string;
  score: number;
  max_score: number;
  exam_date: string;
}

export default function ScoreChart({ scores }: { scores: Score[] }) {
  if (scores.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        성적 데이터가 없습니다.
      </div>
    );
  }

  const data = [...scores]
    .sort((a, b) => a.exam_date.localeCompare(b.exam_date))
    .map((s) => ({
      name: s.exam_name.length > 8 ? s.exam_name.slice(0, 8) + "…" : s.exam_name,
      점수: Number(s.score),
      만점: Number(s.max_score),
      date: s.exam_date,
    }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [`${value}점`, "점수"]}
          labelStyle={{ fontSize: 12 }}
        />
        <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 4" opacity={0.5} />
        <Line
          type="monotone"
          dataKey="점수"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ fill: "#2563eb", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
