// src/loaders/routeLoaders.ts
import { fakeDB } from "../lib/fakeDB";

export const profileLoader = async ({ params }: { params: any }) => {
    const targetUser = fakeDB.profiles.find(p => p.id === params.userId);
    if (!targetUser)
        throw new Response("Not Found", { status: 404 });
    return targetUser;
};

export const rootLoader = () => {
    return {
        activeSession: fakeDB.activeSession,
        profiles: fakeDB.profiles
    };
};