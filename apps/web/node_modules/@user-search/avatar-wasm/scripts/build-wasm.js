import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "@webassemblyjs/wast-parser";
import { moduleToBinary } from "@webassemblyjs/wasm-gen";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.resolve(__dirname, "../../apps/web/public/wasm");
mkdirSync(outDir, { recursive: true });

const wat = `(module
  (memory (export "memory") 1)
  (func $mask (export "mask") (param $dx f32) (param $dy f32) (param $radius f32) (result f32)
    local.get $dx
    local.get $dx
    f32.mul
    local.get $dy
    local.get $dy
    f32.mul
    f32.add
    local.get $radius
    local.get $radius
    f32.mul
    f32.div
    f32.const 1
    f32.sub
    f32.const 0
    f32.max))
)`;

const ast = parse(wat);
const { buffer } = moduleToBinary(ast, { debug: false });

const outPath = path.join(outDir, "avatar_mask.wasm");
writeFileSync(outPath, new Uint8Array(buffer));
console.log(`Generated ${outPath}`);
