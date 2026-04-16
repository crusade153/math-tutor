"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, ChevronUp, ChevronDown, Plus, Images } from "lucide-react";
import Image from "next/image";

interface GalleryImage {
  id: number;
  url: string;
  caption: string | null;
  display_order: number;
  is_active: boolean;
}

export default function GalleryClient({
  images: initialImages,
}: {
  images: GalleryImage[];
}) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [urlInput, setUrlInput] = useState("");
  const [captionInput, setCaptionInput] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setAdding(true);
    const res = await fetch("/api/gallery-images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: urlInput.trim(),
        caption: captionInput.trim() || null,
        display_order: images.length,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      setImages((prev) => [...prev, json.data]);
      setUrlInput("");
      setCaptionInput("");
      toast.success("이미지가 추가되었습니다.");
    } else {
      const json = await res.json();
      toast.error(json.error ?? "추가 실패");
    }
    setAdding(false);
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/gallery-images/${id}`, { method: "DELETE" });
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== id));
      toast.success("이미지가 삭제되었습니다.");
    } else {
      toast.error("삭제 실패");
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const newImages = [...images];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];

    // 순서 업데이트
    const updates = newImages.map((img, i) =>
      fetch(`/api/gallery-images/${img.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_order: i }),
      })
    );
    await Promise.all(updates);
    setImages(newImages.map((img, i) => ({ ...img, display_order: i })));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">갤러리 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          랜딩페이지에 표시될 공부방 이미지를 관리합니다. 최대 10장까지 등록 가능합니다.
        </p>
      </div>

      {/* 이미지 추가 폼 */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Plus size={16} />
            이미지 추가
          </h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1.5">
              <Label>이미지 URL *</Label>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
              />
              <p className="text-xs text-gray-400">
                Google Drive, Notion, 외부 이미지 서버 등의 공개 이미지 링크를 입력하세요.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>캡션 (선택)</Label>
              <Input
                placeholder="이미지 설명 (랜딩페이지에 표시됩니다)"
                value={captionInput}
                onChange={(e) => setCaptionInput(e.target.value)}
                maxLength={200}
              />
            </div>
            <Button type="submit" disabled={adding || images.length >= 10}>
              {adding ? "추가 중..." : "이미지 추가"}
            </Button>
            {images.length >= 10 && (
              <p className="text-xs text-red-500">최대 10장까지 등록할 수 있습니다.</p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* 이미지 목록 */}
      <div>
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Images size={16} />
          등록된 이미지 ({images.length}/10)
        </h2>

        {images.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-400">
              <Images size={40} className="mx-auto mb-3 opacity-30" />
              <p>등록된 이미지가 없습니다.</p>
              <p className="text-sm mt-1">위 폼에서 이미지 URL을 추가해주세요.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {images.map((img, index) => (
              <Card key={img.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* 썸네일 */}
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={img.url}
                        alt={img.caption ?? `이미지 ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-1">순서 {index + 1}</p>
                      <p className="text-sm font-medium truncate">{img.caption ?? "(캡션 없음)"}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{img.url}</p>
                    </div>

                    {/* 순서 조절 + 삭제 */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0}
                      >
                        <ChevronUp size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleMove(index, "down")}
                        disabled={index === images.length - 1}
                      >
                        <ChevronDown size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(img.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
