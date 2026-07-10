// src/features/system-control/index.ts

// 1. Export the primary structural panels
export { ProductsPage } from "./pages/ProductsPage";
export { ProfileDetail } from "./pages/ProfileDetail";

// 2. Export the presentation components
export { UserProfileCard } from "./components/UserProfileCard";
export { ProductCard } from "./components/ProductCard";

// 3. Export the data loaders required by the router
export { rootLoader, profileLoader } from "./loaders/routeLoaders";