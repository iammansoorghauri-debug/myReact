// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router";
import { useAppStore } from "../stores/appStore";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    // Select strictly the session variable from the external vault
    const activeSession = useAppStore((state) => state.activeSession);

    if (!activeSession) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}