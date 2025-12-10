const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["/node_modules/", "/packages/"],
  moduleNameMapper: {
    "^@user-search/core/(.*)$": "<rootDir>/../../packages/core/src/$1",
    "^@user-search/core$": "<rootDir>/../../packages/core/src/index.ts",
    "^@user-search/avatar-wasm/(.*)$": "<rootDir>/../../packages/avatar-wasm/src/$1",
    "^@user-search/avatar-wasm$": "<rootDir>/../../packages/avatar-wasm/src/index.ts",
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1"
  },
  transformIgnorePatterns: ["/node_modules/(?!(@user-search))/"]
};

module.exports = createJestConfig(customJestConfig);
