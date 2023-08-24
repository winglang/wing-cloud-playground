import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  external: ["@wingconsole/app"],
  format: ["cjs"],
  clean: true
});
