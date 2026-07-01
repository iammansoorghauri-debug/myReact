// src/components/LoginForm.tsx
import { useState, useContext } from "react";

import { Form, useActionData, useNavigation } from "react-router";
import { LogContext } from "../App";


function ActionButton({ pendingText, defaultText }: { pendingText: string, defaultText: string }) {
    const navigation = useNavigation();
    const pending = navigation.state === "submitting";

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

export function LoginForm() {
    
    const actionData = useActionData() as { error?: string } | undefined;
    const errorMessage = actionData?.error;

    const [isRegistering, setIsRegistering] = useState(false);

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
            <Form method="post" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input type="hidden" name="intent" value="login" />

                <input
                type="text"
                name="loginUsername"
                placeholder="Username..."
                required
                style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
                />

                <input
                type="password"
                name="loginPassword"
                placeholder="Password..."
                required
                style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
                />

                {errorMessage && <span style={{ color: "red", fontSize: "0.85rem", fontWeight: "bold", textAlign: "center" }}>{errorMessage}</span>}
                <ActionButton defaultText="Secure Login" pendingText="Verifying Keys..." />
            </Form>
        ) : (
            <Form method="post" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input type="hidden" name="intent" value="register" />

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
            </Form>
        )}

        <button
            onClick={() => setIsRegistering(!isRegistering)}
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