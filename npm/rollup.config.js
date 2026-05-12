import { nodeResolve } from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";

const esbuildPlugin = esbuild({ target: "es2022" });

const nodeBuilds = {
  input: {
    index: "src/index.ts",
    Check: "src/Check.ts",
    ApexErrorListener: "src/ApexErrorListener.ts",
    ApexParserFactory: "src/ApexParserFactory.ts",
    CaseInsensitiveInputStream: "src/CaseInsensitiveInputStream.ts",
  },
  external: ["antlr4", /^node:/],
  plugins: [esbuildPlugin],
  output: [
    {
      dir: "dist/esm",
      format: "es",
      entryFileNames: "[name].js",
      chunkFileNames: "[name].js",
      preserveModules: true,
      preserveModulesRoot: "src",
      sourcemap: true,
    },
    {
      dir: "dist/cjs",
      format: "cjs",
      entryFileNames: "[name].cjs",
      chunkFileNames: "[name].cjs",
      preserveModules: true,
      preserveModulesRoot: "src",
      sourcemap: true,
      exports: "named",
    },
  ],
};

const browserEsm = {
  input: "src/index.browser.ts",
  plugins: [nodeResolve({ browser: true }), esbuildPlugin],
  output: {
    file: "dist/browser/apex-parser.mjs",
    format: "es",
    sourcemap: true,
  },
};

const browserUmd = {
  input: "src/index.browser.ts",
  plugins: [nodeResolve({ browser: true }), esbuildPlugin],
  output: {
    file: "dist/browser/apex-parser.umd.js",
    format: "umd",
    name: "ApexParser",
    sourcemap: true,
    exports: "named",
  },
};

export default [nodeBuilds, browserEsm, browserUmd];
