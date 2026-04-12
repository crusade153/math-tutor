"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Link2, Send, Save } from "lucide-react";
import { computeWeakTopics } from "@/lib/examUtils";
import type { ProblemEntry } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  scoreId: number;
  studentName: string;
  examName: string;
}

// 오답 전용 입력 구조 (correct는 항상 false)
interface WrongProblem {
  num: number;
  topic: string;
  points: number;
}

function toWrongProblems(problems: ProblemEntry[]): WrongProblem[] {
  return problems
    .filter((p) => p.correct !== true)
    .map((p) => ({ num: p.num, topic: p.topic, points: p.points }));
}

function toProblemEntries(wrongs: WrongProblem[]): ProblemEntry[] {
  return wrongs.map((w) => ({ ...w, correct: false }));
}

function reNumber(list: WrongProblem[]): WrongProblem[] {
  return list.map((p, i) => ({ ...p, num: i + 1 }));
}

export default function ExamDetailDialog({
  open,
  onClose,
  scoreId,
  studentName,
  examName,
}: Props) {
  const [fileUrl, setFileUrl] = useState("");
  const [wrongs, setWrongs] = useState<WrongProblem[]>([{ num: 1, topic: "", points: 4 }]);
  const [teacherComment, setTeacherComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [savedDetailId, setSavedDetailId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadExisting = useCallback(async () => {
    if (!scoreId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/exam-details?scoreId=${scoreId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const d = json.data;
          setFileUrl(d.file_url ?? "");
          const existing = toWrongProblems(d.problems ?? []);
          setWrongs(existing.length ? existing : [{ num: 1, topic: "", points: 4 }]);
          setTeacherComment(d.teacher_comment ?? "");
          setSavedDetailId(d.id);
        }
      }
    } catch {
      // 신규 입력
    } finally {
      setIsLoading(false);
    }
  }, [scoreId]);

  useEffect(() => {
    if (open) {
      setFileUrl("");
      setWrongs([{ num: 1, topic: "", points: 4 }]);
      setTeacherComment("");
      setSavedDetailId(null);
      loadExisting();
    }
  }, [open, loadExisting]);

  function addProblem() {
    setWrongs((prev) => {
      const last = prev[prev.length - 1];
      return [
        ...prev,
        { num: prev.length + 1, topic: last?.topic ?? "", points: last?.points ?? 4 },
      ];
    });
  }

  function removeProblem(idx: number) {
    setWrongs((prev) => reNumber(prev.filter((_, i) => i !== idx)));
  }

  function updateProblem<K extends keyof WrongProblem>(
    idx: number,
    key: K,
    value: WrongProblem[K]
  ) {
    setWrongs((prev) => prev.map((p, i) => (i === idx ? { ...p, [key]: value } : p)));
  }

  // 실시간 약점 분석 (입력된 오답 목록 기준)
  const problems = toProblemEntries(wrongs);
  const weakTopics = computeWeakTopics(problems);
  const filledCount = wrongs.filter((w) => w.topic.trim()).length;

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/exam-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score_id: scoreId,
          file_url: fileUrl.trim() || null,
          problems: toProblemEntries(wrongs),
          teacher_comment: teacherComment.trim() || null,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setSavedDetailId(json.data.id);
        toast.success("저장되었습니다.");
      } else {
        const json = await res.json();
        toast.error(json.error ?? "저장 실패");
      }
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSendFeedback() {
    if (!savedDetailId) {
      toast.error("먼저 저장 버튼을 눌러주세요.");
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch("/api/exam-details/send-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score_id: scoreId }),
      });

      if (res.ok) {
        toast.success(`${studentName} 학부모에게 성적 피드백이 발송되었습니다!`);
        onClose();
      } else {
        const json = await res.json();
        toast.error(json.error ?? "발송 실패");
      }
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            📋 오답 분석 입력
            <span className="text-sm font-normal text-gray-400">
              — {studentName} · {examName}
            </span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-gray-400 text-sm">불러오는 중...</div>
        ) : (
          <div className="space-y-5 py-1">

            {/* 시험지 링크 */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                <Link2 size={13} className="text-gray-400" />
                시험지 링크
                <span className="text-gray-400 font-normal text-xs">(선택 · Google Drive 등)</span>
              </Label>
              <Input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="text-sm"
              />
            </div>

            {/* 오답 목록 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">
                  틀린 문제 입력
                  <span className="text-gray-400 font-normal text-xs ml-1">
                    (틀린 것만 입력하세요)
                  </span>
                </Label>
                <span className="text-xs text-gray-400">{wrongs.length}개</span>
              </div>

              <div className="rounded-xl border overflow-hidden bg-white">
                {/* 헤더 */}
                <div className="grid grid-cols-[36px_1fr_72px_32px] gap-2 px-3 py-2 bg-gray-50 border-b text-xs font-semibold text-gray-500">
                  <span className="text-center">번호</span>
                  <span>단원 / 유형</span>
                  <span className="text-center">배점</span>
                  <span />
                </div>

                {/* 오답 행 */}
                <div className="divide-y">
                  {wrongs.map((w, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[36px_1fr_72px_32px] gap-2 px-3 py-2 items-center"
                    >
                      {/* 번호 */}
                      <span className="text-sm font-mono text-gray-400 text-center leading-none">
                        {w.num}
                      </span>

                      {/* 단원 */}
                      <Input
                        value={w.topic}
                        onChange={(e) => updateProblem(idx, "topic", e.target.value)}
                        placeholder="예: 이차방정식"
                        className="h-8 text-sm border-gray-200"
                      />

                      {/* 배점 */}
                      <Input
                        type="number"
                        value={w.points}
                        onChange={(e) =>
                          updateProblem(idx, "points", Math.max(0, Number(e.target.value)))
                        }
                        min={0}
                        className="h-8 text-sm text-center border-gray-200"
                      />

                      {/* 삭제 */}
                      <button
                        type="button"
                        onClick={() => removeProblem(idx)}
                        className="flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30"
                        disabled={wrongs.length === 1}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addProblem}
                className="w-full text-sm text-gray-500 border-dashed"
              >
                <Plus size={13} className="mr-1" />
                오답 추가
              </Button>
            </div>

            {/* 실시간 약점 분석 */}
            {filledCount > 0 && (
              <div className="rounded-xl p-4 bg-amber-50 border border-amber-100 space-y-2">
                <p className="text-xs font-semibold text-amber-700">
                  📊 약점 분석 미리보기
                </p>
                <p className="text-xs text-gray-500">
                  틀린 문제 <strong className="text-red-500">{filledCount}개</strong> 분석됨
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {weakTopics.map((t) => (
                    <Badge
                      key={t}
                      className="bg-red-100 text-red-700 border-red-200 text-xs"
                    >
                      ⚠️ {t}
                    </Badge>
                  ))}
                  {weakTopics.length === 0 && (
                    <span className="text-xs text-gray-400">단원명을 입력하면 자동 분류됩니다</span>
                  )}
                </div>
              </div>
            )}

            {/* 선생님 코멘트 */}
            <div className="space-y-1.5">
              <Label className="text-sm">
                선생님 코멘트
                <span className="text-gray-400 font-normal text-xs ml-1">(선택)</span>
              </Label>
              <Textarea
                value={teacherComment}
                onChange={(e) => setTeacherComment(e.target.value)}
                placeholder="격려 메시지나 학습 방향을 입력하세요."
                rows={3}
                className="resize-none text-sm"
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 pt-2 flex-wrap">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            닫기
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="gap-1"
          >
            <Save size={13} />
            {isSaving ? "저장 중..." : "저장"}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSendFeedback}
            disabled={!savedDetailId || isSending || isLoading}
            className="gap-1 bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Send size={13} />
            {isSending ? "발송 중..." : "학부모 알림 발송"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
