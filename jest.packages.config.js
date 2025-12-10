/** @type {import('jest').Config} */
module.exports = {
  displayName: "packages",
  testEnvironment: "node",
  roots: ["<rootDir>/packages"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
  transformIgnorePatterns: ["/node_modules/"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/packages/core/tsconfig.test.json",
        isolatedModules: false
      }
    ]
  },
  moduleFileExtensions: ["ts", "tsx", "js"],
  moduleNameMapper: {
    "^@user-search/core/(.*)$": "<rootDir>/packages/core/src/$1",
    "^@user-search/core$": "<rootDir>/packages/core/src/index.ts",
    "^@user-search/avatar-wasm/(.*)$": "<rootDir>/packages/avatar-wasm/src/$1",
    "^@user-search/avatar-wasm$": "<rootDir>/packages/avatar-wasm/src/index.ts"
  }
};
