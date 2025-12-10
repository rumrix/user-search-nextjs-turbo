/* eslint-disable @next/next/no-img-element */
"use client";

import { applyCircularMask, loadMaskWasm } from "@user-search/avatar-wasm";
import clsx from "clsx";
import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  fallbackSrc?: string;
  alt: string;
  size?: number;
  className?: string;
}

const wasmUrl = "/wasm/avatar_mask.wasm";
let wasmPromise: ReturnType<typeof loadMaskWasm> | null = null;

const AvatarCanvas = ({ src, fallbackSrc, alt, size = 96, className }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const canvas = canvasRef.current;
    if (!canvas || failed) return;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img: HTMLImageElement = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = async () => {
      if (!active) return;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      try {
        wasmPromise = wasmPromise ?? loadMaskWasm(wasmUrl);
        const wasm = await wasmPromise;
        const data = ctx.getImageData(0, 0, size, size);
        const masked = applyCircularMask(data, wasm, { feather: 0.1 });
        ctx.putImageData(masked, 0, 0);
      } catch (error) {
        console.error("wasm processing failed", error);
        setFailed(true);
      }
    };
    img.onerror = () => {
      setFailed(true);
    };

    return () => {
      active = false;
    };
  }, [src, size, failed]);

  if (failed && fallbackSrc) {
    return (
      <NextImage
        src={fallbackSrc}
        alt={alt}
        width={size}
        height={size}
        className={clsx("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-label={alt}
      className={clsx("rounded-full border border-slate-200 dark:border-slate-700", className)}
    />
  );
};

export default AvatarCanvas;
