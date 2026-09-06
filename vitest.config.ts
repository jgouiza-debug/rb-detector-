import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: { alias: { "@": root, "server-only": root + "tests/helpers/empty.ts" } },
  test: {
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["tests/unit/**/*.test.ts"], environment: "node" },
      },
      {
        extends: true,
        test: {
          name: "int",
          include: ["tests/int/**/*.test.ts"],
          environment: "node",
          testTimeout: 90_000,
          hookTimeout: 90_000,
          fileParallelism: false,
        },
      },
    ],
  },
});
