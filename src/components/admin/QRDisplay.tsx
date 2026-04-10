"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, QrCode } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

interface Props {
  lessonId: number;
  appUrl: string;
}

export default function QRDisplay({ lessonId, appUrl }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [generating, setGenerating] = useState(false);

  const generateQR = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/attendance/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", lessonId }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "QR 생성 실패");
        return;
      }

      const json = await res.json();
      const { token, expires_at } = json.data;
      const scanUrl = `${appUrl}/parent/scan?token=${token}`;

      const dataUrl = await QRCode.toDataURL(scanUrl, {
        width: 300,
        margin: 2,
        color: { dark: "#1e40af", light: "#ffffff" },
      });

      setQrDataUrl(dataUrl);
      setExpiresAt(new Date(expires_at));
      toast.success("QR 코드가 생성되었습니다.");
    } catch {
      toast.error("QR 생성 중 오류가 발생했습니다.");
    } finally {
      setGenerating(false);
    }
  }, [lessonId, appUrl]);

  // 카운트다운 타이머
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const diff = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setSecondsLeft(0);
        setQrDataUrl(null);
        setExpiresAt(null);
        toast.warning("QR 코드가 만료되었습니다. 다시 생성해주세요.");
        clearInterval(interval);
      } else {
        setSecondsLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <Card className="text-center">
      <CardContent className="p-6">
        {qrDataUrl ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="출석 QR 코드"
                className="w-64 h-64 rounded-lg border-4 border-blue-100"
              />
            </div>
            <div
              className={`text-lg font-bold ${
                secondsLeft < 60 ? "text-red-500" : "text-blue-600"
              }`}
            >
              만료까지 {minutes}:{String(seconds).padStart(2, "0")}
            </div>
            <p className="text-sm text-gray-500">
              학부모/학생이 카메라로 QR을 스캔하면 자동으로 출석 처리됩니다.
            </p>
            <Button
              variant="outline"
              onClick={generateQR}
              disabled={generating}
              className="w-full"
            >
              <RefreshCw size={16} className="mr-2" />
              QR 새로고침
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCode size={48} className="text-gray-400" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              버튼을 눌러 출석 QR 코드를 생성하세요
            </p>
            <Button
              onClick={generateQR}
              disabled={generating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {generating ? "생성 중..." : "QR 코드 생성"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
