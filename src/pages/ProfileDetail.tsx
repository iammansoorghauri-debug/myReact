// src/pages/ProfileDetail.tsx
import { useOutletContext, useLoaderData, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { UserProfileCard } from "../components/UserProfileCard";
import type { AppContextType } from "../App";
import type { Profile } from "../lib/fakeDB";
import type { AppDispatch } from "../stores/store";

import { pushLog, setInitialData } from "../stores/appSlice";

export function ProfileDetail() {
    const loaderUser = useLoaderData() as Profile;
    const { optimisticProfiles, handlePingUserAction } = useOutletContext<AppContextType>();

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const targetUser = optimisticProfiles.find((p) => p.id === loaderUser.id) || loaderUser;

    // 🚀 LIVE MONGO UPDATE: Toggle online/offline status
    const handleLiveToggleStatus = async () => {
        dispatch(pushLog(`[DATABASE]: Toggling status for ${targetUser.username}...`));
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profiles/${targetUser.id}/toggle`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error("Server rejected status toggle request");

            dispatch(pushLog(`[SUCCESS]: Toggled online presence in MongoDB!`));
            
            // Re-fetch profiles list to sync Redux store state with the true database state
            const syncRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profiles`);
            const updatedProfilesList = await syncRes.json();
            dispatch(setInitialData({ session: loaderUser, profilesList: updatedProfilesList }));
        } catch (error) {
            dispatch(pushLog(`[ERROR]: Failed to update user status in MongoDB.`));
        }
    };

    // 🚀 LIVE MONGO UPDATE: Permanently remove document collection record
    const handleLiveDeleteUser = async () => {
        const confirmDelete = window.confirm(`Are you sure you want to permanently delete ${targetUser.username}?`);
        if (!confirmDelete) return;

        dispatch(pushLog(`[DATABASE]: Sending deletion query for ${targetUser.username} to MongoDB...`));
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profiles/${targetUser.id}`, {
                method: "DELETE"
            });

            if (!response.ok) throw new Error("Server rejected account deletion request");

            dispatch(pushLog(`[SUCCESS]: Entry successfully dropped from MongoDB collections.`));
            navigate("/login");
        } catch (error) {
            dispatch(pushLog(`[ERROR]: Failed to delete document entry from database.`));
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <UserProfileCard
                username={targetUser.username}
                role={targetUser.role}
                isOnline={targetUser.isOnline}
                messagesSent={targetUser.messagesSent}
            >
                <button onClick={() => handlePingUserAction(targetUser.id)} style={{ padding: "5px", cursor: "pointer", backgroundColor: "lightgreen", border: "1px solid black", borderRadius: "4px", fontWeight: "bold" }}>
                    Ping User
                </button>
                
                {/* 🔄 Points to the new database toggle function */}
                <button onClick={handleLiveToggleStatus} style={{ padding: "5px", cursor: "pointer", backgroundColor: "#e2e8f0", border: "1px solid gray", borderRadius: "4px" }}>
                    Toggle Status
                </button>
                
                {/* 🔄 Points to the new database deletion function */}
                <button onClick={handleLiveDeleteUser} style={{ padding: "5px", cursor: "pointer", backgroundColor: "#ffccd5", color: "#b70000", border: "1px solid #b70000", borderRadius: "4px", fontWeight: "bold" }}>
                    Delete Account
                </button>
            </UserProfileCard>
        </div>
    );
}