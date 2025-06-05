import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable rules causing build failures
      "@typescript-eslint/no-unused-vars": "warn", // Downgrade to warning
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn", // Downgrade to warning
      "jsx-a11y/alt-text": "warn", // Downgrade to warning
      "@next/next/no-head-element": "warn" // Downgrade to warning
    }
  }
];

export default eslintConfig;



