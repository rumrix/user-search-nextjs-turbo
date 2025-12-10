/**
 * @jest-environment jsdom
 */
import { applyCircularMask, LoadedMask } from "../src";

const makeImageData = (size: number) => {
  if (typeof ImageData === "undefined") {
    // Minimal polyfill for Node test environment
    class SimpleImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      constructor(data: Uint8ClampedArray, width: number, height: number) {
        this.data = data;
        this.width = width;
        this.height = height;
      }
    }
    globalThis.ImageData = SimpleImageData as unknown as typeof ImageData;
  }
  const array = new Uint8ClampedArray(size * size * 4).fill(255);
  return new ImageData(array, size, size);
};

describe("applyCircularMask", () => {
  it("reduces alpha toward the edges", () => {
    const image = makeImageData(4);
    const wasm: LoadedMask = {
      mask: (dx, dy) => Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy))
    };

    const result = applyCircularMask(image, wasm, { feather: 0.05 });
    const alphaAt = (x: number, y: number) => result.data[(y * result.width + x) * 4 + 3];

    const centerAlpha = alphaAt(2, 2);
    const cornerAlpha = alphaAt(0, 0);
    const edgeAlpha = alphaAt(3, 1);
    const innerAlpha = alphaAt(1, 1);

    expect(centerAlpha).toBe(255);
    expect(cornerAlpha).toBeLessThan(centerAlpha);
    expect(edgeAlpha).toBeLessThan(centerAlpha);
    expect(innerAlpha).toBeGreaterThan(0);
  });
});
