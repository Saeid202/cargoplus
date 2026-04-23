"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

interface SlideImagePreviewProps {
  url: string;
}

export function SlideImagePreview({ url }: SlideImagePreviewProps) {
  const [status, setStatus] = useState<"empty" | "loading" | "ok" | "error">("empty");

  useEffect(() => {
    if (!url || !url.startsWith("https://")) {
      setStatus("empty");
      return;
    }
    setStatus("loading");
  }, [url]);

  if (!url || !url.startsWith("https://")) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 text-sm">
        Image preview will appear here
      </div>
    );
  }

  return (
    <div className="relative h-32 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
      {status === "error" ? (
        <div className="flex h-full flex-col items-center justify-center gap-1 text-red-500">
          <ImageOff className="h-6 w-6" />
          <span className="text-xs">Image could not be loaded — please check the URL</span>
        </div>
      ) : (
        <Image
          src={url}
          alt="Slide preview"
          fill
          className="object-cover"
          onLoad={() => setStatus("ok")}
          onError={() => setStatus("error")}
          unoptimized
        />
      )}
    </div>
  );
}
