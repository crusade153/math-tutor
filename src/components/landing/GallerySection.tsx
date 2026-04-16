"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  id: number;
  url: string;
  caption: string | null;
}

export default function GallerySection({ images }: { images: GalleryImage[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1 || isPaused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [images.length, isPaused, next]);

  if (images.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        {/* 타이틀 */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(30,144,255,0.1), rgba(0,200,83,0.1))",
              color: "#1E90FF",
            }}
          >
            공부방 갤러리
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
            공부에 집중할 수 있는
            <span style={{ color: "#1E90FF" }}> 최적의 환경</span>
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            소음 없는 독립 공간에서 학생 한 명 한 명에게 집중합니다.
          </p>
        </div>

        {/* 캐러셀 */}
        <div
          className="relative rounded-2xl overflow-hidden shadow-xl"
          style={{ aspectRatio: "16/7" }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* 이미지들 */}
          {images.map((img, index) => (
            <div
              key={img.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: index === current ? 1 : 0 }}
            >
              <Image
                src={img.url}
                alt={img.caption ?? `공부방 이미지 ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
                priority={index === 0}
              />
              {/* 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              {/* 캡션 */}
              {img.caption && (
                <div className="absolute bottom-6 left-0 right-0 text-center">
                  <span className="inline-block px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    {img.caption}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* 좌우 화살표 (이미지 2장 이상일 때만) */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}
                aria-label="이전 이미지"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}
                aria-label="다음 이미지"
              >
                <ChevronRight size={20} className="text-white" />
              </button>
            </>
          )}

          {/* 점 인디케이터 */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: index === current ? "20px" : "8px",
                    height: "8px",
                    background: index === current ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                  }}
                  aria-label={`${index + 1}번째 이미지`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
