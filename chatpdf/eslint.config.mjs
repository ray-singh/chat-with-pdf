import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ['next'],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "prefer-const": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "no-undef": "off", // Disable undefined variable checks
      "@typescript-eslint/no-floating-promises": "off", // Disable issues with unhandled promises
      "no-async-promise-executor": "off", // Disable async promise issues
    },
  }),
];

export default eslintConfig;
