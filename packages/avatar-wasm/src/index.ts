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
    if ("instantiateStreaming" in WebAssembly && typeof WebAssembly.instantiateStreaming === "function") {
      const res = await fetch(wasmUrl);
      return WebAssembly.instantiateStreaming(res);
    }
    const buffer = await fetch(wasmUrl).then((r) => r.arrayBuffer());
    return WebAssembly.instantiate(buffer);
  };

  const instance = (await fetchWasm()) as WebAssembly.WebAssemblyInstantiatedSource;
  const mask = (instance.instance ?? (instance as any)).exports.mask as LoadedMask["mask"];
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
