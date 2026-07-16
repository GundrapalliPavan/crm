import baseConfig from "../eslint.config.mjs";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [...baseConfig, ...compat.extends("next/core-web-vitals", "next/typescript")];
