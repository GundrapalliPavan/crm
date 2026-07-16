// Shared base ESLint flat config, extended by backend/frontend/mobile.
// Each app's own eslint.config.mjs imports this and layers framework-specific rules on top.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: ["dist/**", "build/**", ".next/**", "node_modules/**", "coverage/**"],
  },
);
