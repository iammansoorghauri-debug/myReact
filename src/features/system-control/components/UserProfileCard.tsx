// src/components/UserProfileCard.tsx
import React, { createContext, useContext } from "react";
import { useDispatch } from "react-redux";
import { pushLog } from "../../../stores/appSlice";


interface UserCardContextType {
  username: string;
  role: string;
  isOnline: boolean;
  messagesSent: number;
}
const UserCardContext = createContext<UserCardContextType | undefined>(undefined);

function useUserCard() {
  const context = useContext(UserCardContext);
  if (!context) {
    throw new Error("UserProfileCard sub-components must be wrapped inside <UserProfileCard>");
  }
  return context;
}


interface UserProfileProps extends UserCardContextType {
  children?: React.ReactNode;
}

export function UserProfileCard({ username, role, isOnline, messagesSent, children }: UserProfileProps) {
  const dispatch = useDispatch();

  const handleCardClick = () => {
    dispatch(
      pushLog(`Context Broadcast: User interacted with ${username}'s profile card.`)
    );
  };

  return (
    <UserCardContext.Provider value={{ username, role, isOnline, messagesSent }}>
      <div
        onClick={handleCardClick}
        style={{
          border: "1px solid gray",
          padding: "20px",
          borderRadius: "8px",
          width: "250px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          backgroundColor: "white",
          cursor: "pointer",
        }}
      >
        {children}
      </div>
    </UserCardContext.Provider>
  );
}


UserProfileCard.Title = function UserProfileCardTitle() {
  const { username } = useUserCard();
  return <h2>{username}</h2>;
};

UserProfileCard.Role = function UserProfileCardRole() {
  const { role } = useUserCard();
  return <p style={{ color: "gray" }}>{role}</p>;
};

UserProfileCard.Stats = function UserProfileCardStats() {
  const { messagesSent } = useUserCard();
  return (
    <p style={{ fontSize: "0.9rem", color: "#555" }}>
      Pings Sent: <strong>{messagesSent}</strong>
    </p>
  );
};

UserProfileCard.StatusRow = function UserProfileCardStatusRow() {
  const { isOnline } = useUserCard();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "15px",
      }}
    >
      <div
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: isOnline ? "green" : "red",
        }}
      />
      <span>{isOnline ? "Online" : "Offline"}</span>
    </div>
  );
};

UserProfileCard.Actions = function UserProfileCardActions({ children }: { children?: React.ReactNode }) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ display: "flex", flexDirection: "column", gap: "8px" }}
    >
      {children}
    </div>
  );
};