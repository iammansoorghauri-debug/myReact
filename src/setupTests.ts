// Mock modules before importing anything else
jest.mock("./actions/auth", () => ({
  loginAction: jest.fn(),
  logoutUser: jest.fn(),
}));

// Mock react-router
jest.mock("react-router", () => ({
  redirect: jest.fn(),
  useLoaderData: jest.fn(),
}));

// Mock import.meta for CommonJS environment
if (!("import" in global)) {
  (global as any).import = {
    meta: {
      env: {
        VITE_API_BASE_URL: "http://localhost:5173",
      },
    },
  };
}

import "@testing-library/jest-dom";
