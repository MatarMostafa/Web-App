/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/next.js"],
  ignorePatterns: [
    "src/components/ui/hooks/use-mobile.tsx",
    "next.config.js",
    "postcss.config.mjs",
    "tailwind.config.js"
  ],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: true,
      },
    },
  ],
};
