export interface MaskExports {
  mask: (dx: number, dy: number, radius: number) => number;
}

export interface MaskModule {
  exports: MaskExports;
}

export type MaskInstance = WebAssembly.Instance & { exports: MaskExports };

export interface LoadedMask {
  mask: (dx: number, dy: number, radius: number) => number;
}

export const loadMaskWasm = async (wasmUrl: string): Promise<LoadedMask> => {
  const fetchWasm = async () => {
    // Prefer streaming for speed, but gracefully fall back when MIME/content-type is not application/wasm.
    if ("instantiateStreaming" in WebAssembly && typeof WebAssembly.instantiateStreaming === "function") {
      try {
        const res = await fetch(wasmUrl, { cache: "no-store" });
        return await WebAssembly.instantiateStreaming(res);
      } catch {
        // ignore and fall through to arrayBuffer path
      }
    }
    const buffer = await fetch(wasmUrl, { cache: "no-store" }).then((r) => r.arrayBuffer());
    return WebAssembly.instantiate(buffer);
  };

  const instantiated = (await fetchWasm()) as WebAssembly.WebAssemblyInstantiatedSource;
  const instance: WebAssembly.Instance =
    (instantiated as WebAssembly.WebAssemblyInstantiatedSource).instance ??
    ((instantiated as { exports?: unknown }) as WebAssembly.Instance);
  const exports = (instance as WebAssembly.Instance).exports as { mask?: LoadedMask["mask"] };
  const mask = typeof exports.mask === "function" ? exports.mask : () => 1;
  return { mask };
};

export const applyCircularMask = (
  imageData: ImageData,
  wasm: LoadedMask,
  options?: { feather?: number }
) => {
  const { data, width, height } = imageData;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy);
  const feather = options?.feather ?? 0.08;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - cx) / radius;
      const dy = (y - cy) / radius;
      let factor = wasm.mask(dx, dy, 1);
      if (factor < 0) factor = 0;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 1 - feather && distance <= 1) {
        // soften the edge
        const t = (1 - distance) / feather;
        factor *= t;
      }
      const idx = (y * width + x) * 4 + 3;
      data[idx] = Math.min(255, Math.max(0, data[idx] * factor));
    }
  }

  return imageData;
};
