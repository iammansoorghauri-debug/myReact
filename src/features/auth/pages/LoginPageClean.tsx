// src/features/auth/pages/LoginPageClean.tsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import { LoginForm } from "../components/LoginForm";
import type { RootState } from "../../../stores/store";

export function LoginPageClean() {
    const activeSession = useSelector(
        (state: RootState) => state.app.activeSession
    );

    if (activeSession)
        return <Navigate to={`/dashboard/profile/${activeSession.id}`} replace />;

    return <LoginForm />;
}
