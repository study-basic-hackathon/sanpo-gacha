import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig の "@/*" パスエイリアスを解決する
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
