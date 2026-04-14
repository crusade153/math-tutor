"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface Props {
  appUrl: string;
}

export default function RoomQRDisplay({ appUrl }: Props) {
  const [entryQR, setEntryQR] = useState<string>("");
  const [exitQR, setExitQR] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const entryUrl = `${appUrl}/attend?type=entry`;
  const exitUrl = `${appUrl}/attend?type=exit`;

  useEffect(() => {
    async function generateQRs() {
      try {
        // qrcode는 서버사이드 패키지이므로 동적 import
        const QRCode = (await import("qrcode")).default;
        const [entry, exit] = await Promise.all([
          QRCode.toDataURL(entryUrl, {
            width: 260,
            margin: 2,
            color: { dark: "#1d4ed8", light: "#ffffff" },
          }),
          QRCode.toDataURL(exitUrl, {
            width: 260,
            margin: 2,
            color: { dark: "#c2410c", light: "#ffffff" },
          }),
        ]);
        setEntryQR(entry);
        setExitQR(exit);
      } catch (err) {
        console.error("QR 생성 오류:", err);
      } finally {
        setLoading(false);
      }
    }
    generateQRs();
  }, [entryUrl, exitUrl]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
        QR 코드 생성 중...
      </div>
    );
  }

  return (
    <>
      {/* 화면용 */}
      <div className="no-print mt-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 입실 QR */}
          <div className="flex-1 border-2 border-blue-200 rounded-xl p-4 text-center bg-blue-50">
            <p className="text-blue-700 font-bold mb-3 text-lg">입실용 QR</p>
            {entryQR && (
              <img
                src={entryQR}
                alt="입실 QR"
                className="mx-auto rounded-lg"
                style={{ width: 160, height: 160 }}
              />
            )}
            <p className="text-xs text-blue-400 mt-2 break-all">{entryUrl}</p>
          </div>

          {/* 퇴실 QR */}
          <div className="flex-1 border-2 border-orange-200 rounded-xl p-4 text-center bg-orange-50">
            <p className="text-orange-700 font-bold mb-3 text-lg">퇴실용 QR</p>
            {exitQR && (
              <img
                src={exitQR}
                alt="퇴실 QR"
                className="mx-auto rounded-lg"
                style={{ width: 160, height: 160 }}
              />
            )}
            <p className="text-xs text-orange-400 mt-2 break-all">{exitUrl}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1"
          >
            <Printer size={14} />
            인쇄
          </Button>
          <p className="text-xs text-gray-400">
            이 QR은 만료되지 않습니다. 한 번 출력하면 계속 사용할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 인쇄용 */}
      <div className="print-only hidden print:flex gap-8 justify-center items-start pt-8">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-700 mb-4">입실 QR</p>
          {entryQR && (
            <img src={entryQR} alt="입실 QR" style={{ width: 260, height: 260 }} />
          )}
          <p className="text-sm text-gray-500 mt-2">스캔 후 PIN 입력</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-700 mb-4">퇴실 QR</p>
          {exitQR && (
            <img src={exitQR} alt="퇴실 QR" style={{ width: 260, height: 260 }} />
          )}
          <p className="text-sm text-gray-500 mt-2">스캔 후 PIN 입력</p>
        </div>
      </div>
    </>
  );
}
