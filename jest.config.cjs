module.exports = {
    preset: "ts-jest",
    testEnvironment: "jest-environment-jsdom",
    transform: {
        "^.+\\.tsx?$": [
        "ts-jest",
        {
            tsconfig: {
            jsx: "react-jsx",
            module: "esnext",
            target: "ES2022",
            lib: ["ES2022", "DOM", "DOM.Iterable"],
            moduleResolution: "bundler",
            strict: false,
            skipLibCheck: true,
            esModuleInterop: true,
            resolveJsonModule: true,
            types: ["vite/client", "jest", "node", "@testing-library/jest-dom"],
            },
        },
        ],
    },
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
    testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
};
