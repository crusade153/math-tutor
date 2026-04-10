"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle, XCircle, Camera } from "lucide-react";

interface Student {
  id: number;
  name: string;
  grade: string;
}

interface ScanResult {
  ok: boolean;
  studentName?: string;
  className?: string;
  lessonDate?: string;
  error?: string;
}

export default function QRScanner({ students }: { students: Student[] }) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id.toString() ?? ""
  );
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const scannerRef = useRef<unknown>(null);
  const containerId = "qr-reader";

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  async function startScanner() {
    if (!selectedStudentId) {
      toast.error("학생을 선택해주세요.");
      return;
    }

    setResult(null);
    setScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          await handleScan(decodedText);
          await stopScanner();
        },
        undefined
      );
    } catch (err) {
      console.error("QR scanner error:", err);
      toast.error("카메라를 시작할 수 없습니다. 카메라 권한을 확인해주세요.");
      setScanning(false);
    }
  }

  async function stopScanner() {
    try {
      if (scannerRef.current) {
        const scanner = scannerRef.current as { stop: () => Promise<void>; clear: () => void };
        await scanner.stop();
        scanner.clear();
        scannerRef.current = null;
      }
    } catch {
      // 이미 중지된 경우 무시
    }
    setScanning(false);
  }

  async function handleScan(decodedText: string) {
    try {
      // URL에서 token 추출
      let token: string | null = null;
      try {
        const url = new URL(decodedText);
        token = url.searchParams.get("token");
      } catch {
        token = decodedText; // fallback: QR이 토큰 자체인 경우
      }

      if (!token) {
        setResult({ ok: false, error: "QR 코드에서 토큰을 찾을 수 없습니다." });
        return;
      }

      const res = await fetch("/api/attendance/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "scan",
          token,
          studentId: parseInt(selectedStudentId),
        }),
      });

      const json = await res.json();

      if (res.ok) {
        setResult({
          ok: true,
          studentName: json.data.studentName,
          className: json.data.className,
          lessonDate: json.data.lessonDate,
        });
      } else {
        setResult({ ok: false, error: json.error });
      }
    } catch {
      setResult({ ok: false, error: "서버 연결 오류가 발생했습니다." });
    }
  }

  return (
    <div className="space-y-4">
      {/* 학생 선택 */}
      <div className="space-y-1.5">
        <Label>출석할 학생 선택</Label>
        <Select value={selectedStudentId} onValueChange={(v) => v !== null && setSelectedStudentId(v)}>
          <SelectTrigger>
            <SelectValue placeholder="학생 선택" />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {s.name} ({s.grade})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 스캔 결과 */}
      {result && (
        <Card
          className={`border-2 ${
            result.ok ? "border-green-400 bg-green-50" : "border-red-300 bg-red-50"
          }`}
        >
          <CardContent className="py-6 text-center">
            {result.ok ? (
              <div className="space-y-2">
                <CheckCircle className="mx-auto text-green-500" size={48} />
                <p className="text-xl font-bold text-green-700">✅ 출석 완료!</p>
                <p className="text-green-600">{result.studentName} 학생</p>
                <p className="text-sm text-green-500">
                  {result.className} · {result.lessonDate}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <XCircle className="mx-auto text-red-400" size={48} />
                <p className="text-lg font-semibold text-red-600">스캔 실패</p>
                <p className="text-sm text-red-500">{result.error}</p>
              </div>
            )}
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setResult(null)}
            >
              다시 스캔
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 카메라 뷰 */}
      {!result && (
        <div className="space-y-3">
          <div
            id={containerId}
            className={`w-full rounded-lg overflow-hidden bg-black min-h-[200px] ${
              !scanning ? "hidden" : ""
            }`}
          />

          {!scanning ? (
            <Button
              onClick={startScanner}
              className="w-full bg-blue-600 hover:bg-blue-700 py-6"
              disabled={!selectedStudentId}
            >
              <Camera size={20} className="mr-2" />
              카메라로 QR 스캔
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={stopScanner}
              className="w-full"
            >
              스캔 중지
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
