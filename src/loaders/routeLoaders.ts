// src/loaders/routeLoaders.ts

export const profileLoader = async ({ params }: { params: any }) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profiles`);
        const profiles = await response.json();
        
        const targetUser = profiles.find((p: any) => p.id === params.userId);
        
        if (!targetUser) {
            throw new Response("User Not Found in Database", { status: 404 });
        }
        return targetUser;
    } catch (error) {
        console.error("Error inside profileLoader:", error);
        throw new Response("Database Connection Error", { status: 500 });
    }
};

export const rootLoader = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profiles`);
        const realProfiles = await response.json();

        return {
            activeSession: null,
            profiles: realProfiles
        };
    } catch (error) {
        console.error("Failed to fetch from real database", error);
        return { activeSession: null, profiles: [] };
    }
};