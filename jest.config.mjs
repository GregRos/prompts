/** @type {import("jest").Config} */
export default {
    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                tsconfig: "<rootDir>/test/tsconfig.json",
                transpileOnly: true
            }
        ]
    },
    moduleNameMapper: {
        // map .js to .ts
        "^(\\.{1,2}/.*)\\.js$": "$1",
        "@lib": "<rootDir>/src/index",
        "@lib/(.*)": "<rootDir>/src/$1"
    },
    testEnvironment: "node",
    testMatch: ["<rootDir>/test/**/*.test.ts"],
    collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
    coverageDirectory: "./coverage",
    collectCoverage: false
}
