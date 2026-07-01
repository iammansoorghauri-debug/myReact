// src/actions/auth.ts
import { redirect } from "react-router";
import { fakeDB } from "../lib/fakeDB";

export const loginAction = async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "login") {
        const username = formData.get("loginUsername") as string;
        const password = formData.get("loginPassword") as string;

        const matchedUser = fakeDB.profiles.find(
        (user) => user.username === username && user.password === password
        );

        if (matchedUser){
            fakeDB.activeSession = matchedUser;
            return redirect(`/dashboard/profile/${matchedUser.id}`);
        }
        else{
            return{ error: "Invalid username or password." };
        }
    }

    if (intent === "register") {
        const newUsername = formData.get("regUsername") as string;
        if (fakeDB.profiles.some(p => p.username === newUsername)) {
            return { error: "That username is already taken." };
        }

        const newProfile = {
        id: Date.now().toString(),
        username: newUsername,
        password: formData.get("regPassword") as string,
        role: formData.get("regRole") as string,
        isOnline: true,
        messagesSent: 0
        };

        fakeDB.profiles.push(newProfile);
        fakeDB.activeSession = newProfile;
        return redirect(`/dashboard/profile/${newProfile.id}`);
    }

    return null;
};

export const logoutUser = () => {
    fakeDB.activeSession = null;
};