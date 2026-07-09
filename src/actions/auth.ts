// src/actions/auth.ts
// @ts-ignore
import { redirect } from "react-router";

// Handle import.meta.env for both Vite and Jest environments
const getApiUrl = () => {
    try {
        // @ts-ignore
        if (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
        // @ts-ignore
        return import.meta.env.VITE_API_BASE_URL;
        }
    } catch (e) {
        // Fallback for Jest environment
    }
    return (
        (global as any).import?.meta?.env?.VITE_API_BASE_URL ||
        "http://localhost:5173"
    );
};

export const loginAction = async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    const intent = formData.get("intent");
    const apiUrl = getApiUrl();

    if (intent === "login") {
        const username = formData.get("loginUsername") as string;
        const password = formData.get("loginPassword") as string;

        try {
        // 🚀 GET users from MongoDB to check credentials
        const res = await fetch(`${apiUrl}/profiles`);
        const profiles = await res.json();

        const matchedUser = profiles.find(
            (user: any) => user.username === username && user.password === password
        );

        if (matchedUser) {
            // Redux takes over the active session state, so we just redirect!
            return redirect(`/dashboard/profile/${matchedUser.id}`);
        } else {
            return { error: "Invalid username or password." };
        }
        } catch (error) {
        return { error: "Failed to connect to the database." };
        }
    }

    if (intent === "register") {
        const newUsername = formData.get("regUsername") as string;

        try {
        // POST the new user directly to your Node backend
        const response = await fetch(`${apiUrl}/profiles`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            id: Date.now().toString(), // Generating a unique string ID
            username: newUsername,
            password: formData.get("regPassword") as string,
            role: formData.get("regRole") as string,
            isOnline: true,
            messagesSent: 0,
            }),
        });

        if (!response.ok) {
            return { error: "That username is likely already taken." };
        }

        const newProfile = await response.json();
        return redirect(`/dashboard/profile/${newProfile.id}`);
        } catch (error) {
        return { error: "Could not reach the server to register." };
        }
    }

    return null;
};

export const logoutUser = () => {
    return true;
};
