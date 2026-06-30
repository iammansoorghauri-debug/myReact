// src/components/LoginForm.tsx
import { useState, useContext } from "react";
import { useFormStatus } from "react-dom";
import { LogContext } from "../App";

interface LoginFormProps {
    profilesList: any[];
    onLoginSuccess: (authenticatedUser: any) => void;
    onRegisterSuccess: (newUser: any) => void;
}

function ActionButton({ pendingText, defaultText }: { pendingText: string, defaultText: string }) {
    const { pending } = useFormStatus();
    return (
        <button
        type="submit"
        disabled={pending}
        style={{
            padding: "12px",
            backgroundColor: pending ? "#6c757d" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: pending ? "not-allowed" : "pointer"
        }}
        >
        {pending ? pendingText : defaultText}
        </button>
    );
}

export function LoginForm({ profilesList, onLoginSuccess, onRegisterSuccess }: LoginFormProps) {
    const pushLog = useContext(LogContext);
    
    const [errorMessage, setErrorMessage] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    const handleLoginAction = async (formData: FormData) => {
        setErrorMessage("");
        const usernameInput = formData.get("loginUsername") as string;
        const passwordInput = formData.get("loginPassword") as string;

        if (pushLog)
            pushLog(`[AUTH]: Processing login attempt for: "${usernameInput}"...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const matchedUser = profilesList.find(
        (user) => user.username === usernameInput && user.password === passwordInput
        );

        if (matchedUser){
            if (pushLog)
                pushLog(`[AUTH SUCCESS]: Access granted to ${usernameInput}.`);
            onLoginSuccess(matchedUser);
        }
        else{
            if (pushLog)
                pushLog(`[AUTH FAILED]: No profile matched credentials.`);
            setErrorMessage("Invalid username or password.");
        }
    };

    const handleRegisterAction = async (formData: FormData) => {
        setErrorMessage("");
        const newUsername = formData.get("regUsername") as string;
        const newPassword = formData.get("regPassword") as string;
        const newRole = formData.get("regRole") as string;

        if (newUsername.trim().length < 3 || newUsername.includes(" ")) {
            setErrorMessage("Username must be at least 3 chars and contain no spaces.");
        return;
        }
        if (profilesList.some(p => p.username === newUsername)) {
            setErrorMessage("That username is already taken.");
        return;
        }

        if (pushLog)
            pushLog(`[REGISTER]: Building new profile for: "${newUsername}"...`);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const newProfile = {
        id: Date.now().toString(),
        username: newUsername,
        password: newPassword,
        role: newRole,
        isOnline: true,
        messagesSent: 0
        };

        if (pushLog)
            pushLog(`[REGISTER SUCCESS]: Profile created! Auto-logging in...`);
        onRegisterSuccess(newProfile);
    };



    return (
        <div style={{
        maxWidth: "350px",
        margin: "100px auto",
        padding: "30px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
        }}>
        <div style={{ textAlign: "center" }}>
            <h2 style={{ margin: "0 0 5px 0" }}>System Gateway</h2>
            <p style={{ color: "#666", fontSize: "0.9rem", margin: 0 }}>
            {isRegistering ? "Create your new profile keys." : "Enter your profile credentials."}
            </p>
        </div>

        {!isRegistering ? (
            <form action={handleLoginAction} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input
                type="text"
                name="loginUsername"
                placeholder="Username..."
                required
                style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} />

                <input
                type="password"
                name="loginPassword"
                placeholder="Password..."
                required
                style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} />

                {errorMessage && <span style={{ color: "red", fontSize: "0.85rem", fontWeight: "bold", textAlign: "center" }}>{errorMessage}</span>}
                <ActionButton defaultText="Secure Login" pendingText="Verifying Keys..." />
            </form>
        ) : (
            <form action={handleRegisterAction} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input
                type="text"
                name="regUsername"
                placeholder="Choose a Username..."
                required
                style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} />

                <input
                type="password"
                name="regPassword"
                placeholder="Choose a Password..."
                required
                style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} />

                <input
                type="text"
                name="regRole"
                placeholder="Your Job Role..."
                required
                style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} />

                {errorMessage && <span style={{ color: "red", fontSize: "0.85rem", fontWeight: "bold", textAlign: "center" }}>{errorMessage}</span>}
                <ActionButton defaultText="Create Profile" pendingText="Building Profile..." />
            </form>
        )}

        <button
            onClick={() => { setIsRegistering(!isRegistering); setErrorMessage(""); }}
            style={{ background: "none", border: "none", color: "#007bff", textDecoration: "underline", cursor: "pointer", fontSize: "0.9rem" }}
        >
            {isRegistering ? "Already have a profile? Log in." : "Need an account? Sign up here."}
        </button>

        {!isRegistering && (
            <div style={{ backgroundColor: "#f8f9fa", padding: "10px", borderRadius: "4px", fontSize: "0.8rem", border: "1px dashed #bbb" }}>
            <strong>Valid Test Profiles:</strong>
            <ul style={{ margin: "5px 0 0 0", paddingLeft: "15px" }}>
                <li>mansoorghauri / mansoor123</li>
                <li>sarahodd / sarah123</li>
            </ul>
            </div>
        )}
        </div>
    );
}