// src/components/UserProfileCard.tsx
import React from "react";
import { useAppStore } from "../stores/appStore";

interface UserProfileProps {
  username: string;
  role: string;
  isOnline: boolean;
  messagesSent: number;
  children?: React.ReactNode;
}

export function UserProfileCard({ username, role, isOnline, messagesSent, children }: UserProfileProps) {
  // Grab the logging action selector directly from the central store
  const pushGlobalLog = useAppStore((state) => state.pushLog);

  const handleCardClick = () => {
    pushGlobalLog(`Context Broadcast: User interacted with ${username}'s profile card.`);
  };

  return (
    <div onClick={handleCardClick} style={{
      border: "1px solid gray",
      padding: "20px",
      borderRadius: "8px",
      width: "250px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "white",
      cursor: "pointer"
    }}>
    
      <h2>{username}</h2>
      <p style={{ color: "gray" }}>{role}</p>
      
      <p style={{ fontSize: "0.9rem", color: "#555" }}>
        Pings Sent: <strong>{messagesSent}</strong>
      </p>
      
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
        <div style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: isOnline ? "green" : "red"
        }} />
        <span>{isOnline ? "Online" : "Offline"}</span>
      </div>

      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {children}
      </div>

    </div>
  );
}