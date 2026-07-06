// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../stores/store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    // Standard RTK Selector to grab the session variable from the Redux store
    const activeSession = useSelector((state: RootState) => state.app.activeSession);

    if (!activeSession) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}