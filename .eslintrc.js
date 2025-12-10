module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  plugins: ["@typescript-eslint"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "./tsconfig.base.json",
    ecmaVersion: "latest",
    sourceType: "module"
  },
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  settings: {
    next: {
      rootDir: ["apps/web"]
    }
  },
  ignorePatterns: ["**/node_modules", "**/.next", "**/dist", "**/coverage"],
  overrides: [
    {
      files: ["**/__tests__/**/*.{ts,tsx,js,jsx}", "**/*.test.{ts,tsx,js,jsx}"],
      env: {
        jest: true
      }
    }
  ]
};
