"use client";

import { useState, useEffect, useRef } from "react";

interface AttendResult {
  ok: boolean;
  type: "entry" | "exit";
  studentName: string;
  className: string;
  lessonDate: string;
  message: string;
}

export default function PinAttendanceClient({
  type,
}: {
  type: "entry" | "exit";
}) {
  const [pin, setPin] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [result, setResult] = useState<AttendResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(4);
  const inputRef = useRef<HTMLInputElement>(null);

  const isEntry = type === "entry";
  const themeColor = isEntry ? "blue" : "orange";

  // 성공 후 카운트다운 & 자동 초기화
  useEffect(() => {
    if (state !== "success") return;
    setCountdown(4);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setState("idle");
          setPin("");
          setResult(null);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  // idle 상태에서 input 자동 포커스
  useEffect(() => {
    if (state === "idle") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [state]);

  function handlePinChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setPin(digits);
  }

  // 4자리 완성 시 자동 제출
  useEffect(() => {
    if (pin.length === 4 && state === "idle") {
      handleSubmit(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  async function handleSubmit(pinValue: string) {
    if (pinValue.length !== 4) return;
    setState("loading");
    try {
      const res = await fetch("/api/attendance/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinValue, type }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setState("success");
        setResult(json.data);
      } else {
        setState("error");
        setErrorMsg(json.error ?? "오류가 발생했습니다.");
      }
    } catch {
      setState("error");
      setErrorMsg("서버에 연결할 수 없습니다.");
    }
  }

  function handleRetry() {
    setState("idle");
    setPin("");
    setErrorMsg("");
    setResult(null);
  }

  // 성공 화면
  if (state === "success" && result) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-6 ${
          isEntry ? "bg-blue-50" : "bg-orange-50"
        }`}
      >
        <div
          className={`w-full max-w-sm rounded-2xl shadow-lg p-8 text-center ${
            isEntry ? "bg-blue-600" : "bg-orange-500"
          } text-white`}
        >
          <div className="text-6xl mb-4">{isEntry ? "✓" : "👋"}</div>
          <h2 className="text-2xl font-bold mb-1">{result.message}</h2>
          <p className="text-white/80 text-sm mb-4">{result.className}</p>
          <p className="text-white/60 text-xs">{countdown}초 후 자동으로 초기화됩니다</p>
        </div>
      </div>
    );
  }

  // 에러 화면
  if (state === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-red-50">
        <div className="w-full max-w-sm rounded-2xl shadow-lg p-8 text-center bg-white border border-red-200">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">확인 실패</h2>
          <p className="text-gray-600 mb-6">{errorMsg}</p>
          <button
            onClick={handleRetry}
            className="w-full py-3 rounded-xl bg-gray-800 text-white font-semibold text-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 기본 PIN 입력 화면
  return (
    <div
      className={`min-h-screen flex flex-col ${
        isEntry ? "bg-blue-50" : "bg-orange-50"
      }`}
    >
      {/* 상단 헤더 */}
      <div
        className={`py-6 px-6 text-white text-center ${
          isEntry ? "bg-blue-600" : "bg-orange-500"
        }`}
      >
        <p className="text-sm font-medium opacity-80 mb-1">수학 공부방</p>
        <h1 className="text-2xl font-bold">
          {isEntry ? "입실 체크" : "퇴실 체크"}
        </h1>
      </div>

      {/* PIN 입력 카드 */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
          <p className="text-center text-gray-500 mb-6 text-sm">
            4자리 PIN을 입력하세요
          </p>

          {/* PIN 표시 (점으로) */}
          <div className="flex justify-center gap-4 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all ${
                  pin.length > i
                    ? isEntry
                      ? "bg-blue-600"
                      : "bg-orange-500"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* 숨겨진 실제 input (모바일 키보드 용) */}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={pin}
            onChange={(e) => handlePinChange(e.target.value)}
            className="opacity-0 absolute w-0 h-0"
            autoComplete="off"
            disabled={state === "loading"}
          />

          {/* 숫자 키패드 */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => handlePinChange(pin + n.toString())}
                disabled={state === "loading" || pin.length >= 4}
                className={`py-4 rounded-xl text-2xl font-semibold transition-colors ${
                  isEntry
                    ? "bg-blue-50 text-blue-900 active:bg-blue-200"
                    : "bg-orange-50 text-orange-900 active:bg-orange-200"
                } disabled:opacity-50`}
              >
                {n}
              </button>
            ))}
            {/* 빈칸 */}
            <div />
            {/* 0 */}
            <button
              onClick={() => handlePinChange(pin + "0")}
              disabled={state === "loading" || pin.length >= 4}
              className={`py-4 rounded-xl text-2xl font-semibold transition-colors ${
                isEntry
                  ? "bg-blue-50 text-blue-900 active:bg-blue-200"
                  : "bg-orange-50 text-orange-900 active:bg-orange-200"
              } disabled:opacity-50`}
            >
              0
            </button>
            {/* 지우기 */}
            <button
              onClick={() => setPin((p) => p.slice(0, -1))}
              disabled={state === "loading" || pin.length === 0}
              className="py-4 rounded-xl text-xl bg-gray-100 text-gray-600 active:bg-gray-200 disabled:opacity-50"
            >
              ←
            </button>
          </div>

          {state === "loading" && (
            <p className="text-center text-gray-400 mt-4 text-sm">확인 중...</p>
          )}
        </div>

        {/* 안내 문구 */}
        <p className="text-xs text-gray-400 mt-4 text-center">
          PIN을 모르면 선생님께 문의하세요
        </p>
      </div>
    </div>
  );
}
