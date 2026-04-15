"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, ClipboardList } from "lucide-react";

interface Student {
  id: number;
  name: string;
  grade: string;
}

interface LessonLog {
  id: number;
  lesson_id: number;
  class_name: string;
  lesson_date: string;
  start_time: string;
  end_time: string;
  topic: string | null;
  content: string;
  homework: string | null;
  updated_at: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
}

export default function ParentLessonLogsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [logs, setLogs] = useState<LessonLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((json) => {
        const list = json.data ?? [];
        setStudents(list);
        if (list.length > 0) {
          setSelectedStudentId(list[0].id.toString());
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedStudentId) return;
    setLoading(true);
    fetch(`/api/parent/lesson-logs?studentId=${selectedStudentId}`)
      .then((r) => r.json())
      .then((json) => {
        setLogs(json.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [selectedStudentId]);

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen size={22} className="text-indigo-600" />
          수업 일지
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          선생님이 공유한 수업 내용과 숙제를 확인하세요.
        </p>
      </div>

      {/* 자녀 선택 */}
      {students.length > 1 && (
        <div className="mb-5">
          <Select
            value={selectedStudentId}
            onValueChange={(v) => v && setSelectedStudentId(v)}
          >
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="자녀 선택" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">불러오는 중...</div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400 text-sm">
              아직 공유된 수업 일지가 없습니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="overflow-hidden">
              <div className="px-5 py-3 bg-indigo-50 border-b flex items-center justify-between">
                <div>
                  <p className="font-semibold text-indigo-800 text-sm">
                    {log.class_name}
                    {log.topic && (
                      <span className="ml-2 font-normal text-indigo-500">
                        — {log.topic}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-indigo-400 mt-0.5">
                    {formatDate(log.lesson_date)}{" "}
                    {log.start_time.slice(0, 5)} ~ {log.end_time.slice(0, 5)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs bg-white text-indigo-600 border-indigo-200"
                >
                  수업일지
                </Badge>
              </div>
              <CardContent className="p-5 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    수업 내용
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {log.content}
                  </p>
                </div>
                {log.homework && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs font-semibold text-amber-600 mb-1">
                      숙제
                    </p>
                    <p className="text-sm text-amber-800 whitespace-pre-wrap">
                      {log.homework}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
