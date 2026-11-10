import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const runtime = dirname(require.resolve("@rive-app/webgl2"));
const target = new URL("../public/rive/", import.meta.url);
mkdirSync(target, { recursive: true });
copyFileSync(join(runtime, "rive.wasm"), new URL("rive.wasm", target));
console.log("Copied the installed Rive WASM to public/rive/rive.wasm");
