import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    openHandlesTimeout: 10000,
    testTimeout: 10000,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        '<rootDir>/src/components/**/*.ts',
    ],
    coveragePathIgnorePatterns: [
        '<rootDir>/src/components/utils/asyncHandler.ts'
    ],
};

export default config;