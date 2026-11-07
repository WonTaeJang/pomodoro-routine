import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // 타이머 로직 등 순수 계산만 테스트하므로 브라우저 환경 없이 실행
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
