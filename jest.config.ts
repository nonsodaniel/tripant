import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts?(x)"],
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/app/api/**/*.ts",
    "!src/lib/hooks/useGeolocation.ts",
    "!**/*.d.ts",
  ],
};

export default createJestConfig(config);
