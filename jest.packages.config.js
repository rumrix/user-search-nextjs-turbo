/** @type {import('jest').Config} */
module.exports = {
  displayName: "packages",
  testEnvironment: "node",
  roots: ["<rootDir>/packages"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.jest.json"
      }
    ]
  },
  moduleNameMapper: {
    "^@user-search/core/(.*)$": "<rootDir>/packages/core/src/$1",
    "^@user-search/core$": "<rootDir>/packages/core/src/index.ts",
    "^@user-search/avatar-wasm/(.*)$": "<rootDir>/packages/avatar-wasm/src/$1",
    "^@user-search/avatar-wasm$": "<rootDir>/packages/avatar-wasm/src/index.ts"
  }
};
