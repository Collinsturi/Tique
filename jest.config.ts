import type {Config} from 'jest';

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    openHandlesTimeout: 10000,
    testTimeout: 10000,
    // collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts',
    ]
};

export default config;