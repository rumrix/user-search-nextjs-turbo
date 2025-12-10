module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "eslint:recommended", "prettier"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "./tsconfig.base.json"
  },
  settings: {
    next: {
      rootDir: ["apps/web"]
    }
  },
  ignorePatterns: ["**/node_modules", "**/.next", "**/dist", "**/coverage"]
};
