// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useOutletContext } from "react-router";
import type { AppContextType } from "../App";
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { activeSession } = useOutletContext<AppContextType>();

    if (!activeSession) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}