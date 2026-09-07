import path from "node:path";
import { Config } from "@remotion/cli/config";

// Assets live in Next's public dir, so staticFile("pause/pip-open.png") resolves
// the same way in `remotion studio`, `remotion render`, and the in-app Player.
Config.setPublicDir("public");
Config.setOverwriteOutput(true);
Config.setEntryPoint("remotion/index.ts");

// Honour the `@/*` path alias from tsconfig inside Remotion's bundler.
Config.overrideWebpackConfig((current) => ({
  ...current,
  resolve: {
    ...current.resolve,
    alias: { ...(current.resolve?.alias ?? {}), "@": path.resolve(process.cwd()) },
  },
}));
