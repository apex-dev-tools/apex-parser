import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // global ignore
    ignores: ["src/antlr/", "dist/", "snapshots/", "eslint.config.js"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      quotes: ["warn", "double", { avoidEscape: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  }
);
