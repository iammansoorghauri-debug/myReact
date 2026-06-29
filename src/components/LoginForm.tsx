// src/components/LoginForm.tsx
import { useState, useContext } from "react";
import { useFormStatus } from "react-dom";
import { LogContext } from "../App";

interface LoginFormProps {
    profilesList: any[];
    onLoginSuccess: (authenticatedUser: any) => void;
    onRegisterSuccess: (newUser: any) => void;
}

/* CONCEPT: useFormStatus
    Why? This hook gives you status information about the form that currently wraps it.
    CRITICAL RULE: This hook ONLY works if it is called from a component rendered
    *inside* the <form> tag. It will not work if called directly inside `LoginForm`.
    That is why the button is extracted into its own `ActionButton` component.
*/
function ActionButton({ pendingText, defaultText }: { pendingText: string, defaultText: string }) {
    // `pending` will be true while the async function passed to the form's `action` is running.
    const { pending } = useFormStatus();
    
    return (
        <button
            type="submit"
            disabled={pending} // Prevents double-clicking while processing
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
            {/* Dynamically change text based on loading state */}
            {pending ? pendingText : defaultText}
        </button>
    );
}

export function LoginForm({ profilesList, onLoginSuccess, onRegisterSuccess }: LoginFormProps) {
    /* CONCEPT: useContext
        Why? We are "consuming" the LogContext created in App.tsx.
        Now we can call `pushLog()` directly here without needing it passed as a prop.
    */
    const pushLog = useContext(LogContext);
    
    // Standard local UI states for managing errors and toggling the view
    const [errorMessage, setErrorMessage] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    /* CONCEPT: Form Actions (React 19 / Modern React feature)
        Why? Instead of `onSubmit={(e) => { e.preventDefault(); ... }}`, modern React
        allows you to pass an async function directly to the `<form action={...}>` prop.
        React automatically handles the `e.preventDefault()` and manages the loading state
        (which `useFormStatus` hooks into).
    */
    const handleLoginAction = async (formData: FormData) => {
        setErrorMessage("");
        
        /* CONCEPT: FormData API
            Why? Instead of creating a `useState` for every single input (controlled inputs),
            we let the browser handle the inputs (uncontrolled) and extract the values
            using the standard web `FormData` API via the input's `name` attribute.
        */
        const usernameInput = formData.get("loginUsername") as string;
        const passwordInput = formData.get("loginPassword") as string;

        if (pushLog)
            pushLog(`[AUTH]: Processing login attempt for: "${usernameInput}"...`);
        
        // Simulating a network request to see the `pending` state in the button
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const matchedUser = profilesList.find(
            (user) => user.username === usernameInput && user.password === passwordInput
        );

        if (matchedUser){
            if (pushLog)
                pushLog(`[AUTH SUCCESS]: Access granted to ${usernameInput}.`);
            onLoginSuccess(matchedUser); // Lift state up to App.tsx
        }
        else{
            if (pushLog)
                pushLog(`[AUTH FAILED]: No profile matched credentials.`);
            setErrorMessage("Invalid username or password.");
        }
    };


    const handleRegisterAction = async (formData: FormData) => {
        setErrorMessage("");
        
        // Extracting data via the `name` attributes on the register form inputs
        const newUsername = formData.get("regUsername") as string;
        const newPassword = formData.get("regPassword") as string;
        const newRole = formData.get("regRole") as string;

        // Basic validation
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
            id: Date.now().toString(), // Quick way to generate a unique ID
            username: newUsername,
            password: newPassword,
            role: newRole,
            isOnline: true,
            messagesSent: 0
        };

        if (pushLog)
            pushLog(`[REGISTER SUCCESS]: Profile created! Auto-logging in...`);
        onRegisterSuccess(newProfile); // Lift state up to App.tsx
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
                /* Notice we use `action=` here instead of `onSubmit=`.
                   This connects the form to React's transition and status features. */
                <form action={handleLoginAction} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {/* Inputs must have a `name` attribute so FormData can find them */}
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
                    
                    {/* The ActionButton is nested inside the form, so `useFormStatus` will work */}
                    <ActionButton defaultText="Secure Login" pendingText="Verifying Keys..." />
                </form>
            ) : (
                <form action={handleRegisterAction} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <input
                        type="text"
                        name="regUsername"
                        placeholder="Choose a Username..."
                        required
                        style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} 
                    />

                    <input
                        type="password"
                        name="regPassword"
                        placeholder="Choose a Password..."
                        required
                        style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} 
                    />

                    <input
                        type="text"
                        name="regRole"
                        placeholder="Your Job Role..."
                        required
                        style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} 
                    />

                    {errorMessage && <span style={{ color: "red", fontSize: "0.85rem", fontWeight: "bold", textAlign: "center" }}>{errorMessage}</span>}
                    <ActionButton defaultText="Create Profile" pendingText="Building Profile..." />
                </form>
            )}

            {/* Toggle View Button */}
            <button
                // We use `type="button"` implicitly or prevent default if this was in a form,
                // but since it's outside the forms, an onClick works perfectly.
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