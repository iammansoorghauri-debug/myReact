// src/App.tsx

import { useState, useEffect, createContext, useRef, useOptimistic, startTransition } from "react";
import { UserProfileCard } from "./components/UserProfileCard";
import { LoginForm } from "./components/LoginForm";

// Typescript interface to define the shape of our User Profile data.
interface Profile {
  id: string;
  username: string;
  password: string;
  role: string;
  isOnline: boolean;
  messagesSent: number;
}

/* CONCEPT: Context API (createContext)
  Why? To avoid "prop drilling". Instead of passing the `pushLog` function
  down through every single component layer as a prop, any child component
  can now consume this context to write logs to the screen.
*/
export const LogContext = createContext<((text: string) => void) | null>(null);

export default function App() {
  /* CONCEPT: useState
    Why? For variables that should trigger a UI re-render when they change.
    Here we manage the currently logged-in user, the database of all profiles,
    and the list of text logs appearing at the bottom.
  */
  const [activeSession, setActiveSession] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([
    { id: "1", username: "mansoorghauri", password: "mansoor123", role: "Software Engineer", isOnline: true, messagesSent: 0 },
    { id: "2", username: "sarahodd", password: "sarah123", role: "UI Designer", isOnline: false, messagesSent: 0 }
  ]);
  const [onScreenLogs, setOnScreenLogs] = useState<string[]>([]);

  /* CONCEPT: useRef
    Why? For mutable values that you want to remember across renders,
    BUT you DO NOT want to trigger a component re-render when they change.
    We use it here to silently track background clicks.
  */
  const totalClicksTracker = useRef<number>(0);

  // Helper function to update our logs state
  const pushLog = (text: string) => {
    setOnScreenLogs((currentLogs) => [...currentLogs, text]);
  };

  /* CONCEPT: useEffect
    Why? To run "side effects". The empty dependency array `[]` means
    this code will only run exactly once when the App component first mounts.
  */
  useEffect(() => {
    pushLog("App mounted. Awaiting secure authentication...");
  }, []);

  /* CONCEPT: useOptimistic (React 18/19 feature)
    Why? To make the UI feel lightning fast.
    Instead of waiting for the database to reply (which takes time), we create
    an "optimistic" version of our state. We update the UI instantly assuming
    the network request will succeed, while the real request happens in the background.
  */
  const [optimisticProfiles, setOptimisticProfiles] = useOptimistic(
    profiles, // The base state to build upon
    (currentProfiles, idToUpdate: string) =>
      currentProfiles.map((profile) =>
        profile.id === idToUpdate
          ? { ...profile, messagesSent: profile.messagesSent + 1 } // Fake it till you make it!
          : profile
      )
  );

  const handlePingUserAction = (id: string) => {
    /* CONCEPT: startTransition
      Why? It tells React: "This state update is a transition (not urgent).
      Keep the UI responsive while you figure it out in the background."
      It is required to trigger the `useOptimistic` state update above.
    */
    startTransition(async () => {
      // 1. Update our silent tracker (no re-render caused here)
      totalClicksTracker.current += 1;

      // 2. Trigger the instant, optimistic UI update
      setOptimisticProfiles(id);
      pushLog(`[OPTIMISTIC]: UI instantly updated. Sending to database...`);

      try {
        // 3. Simulate a slow network/database request (1.5 seconds)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // 4. Actually update the TRUE state now that the "network" succeeded
        setProfiles((prevProfiles) =>
          prevProfiles.map((profile) =>
            profile.id === id ? { ...profile, messagesSent: profile.messagesSent + 1 } : profile
          )
        );
        pushLog(`[SUCCESS]: Database successfully saved the ping!`);
      } catch (error) {
        // If it failed, the optimistic state automatically rolls back!
        pushLog(`[ERROR]: Network failed. Rolling back UI.`);
      }
    });
  };

  // Standard state update (React will re-render to reflect the new boolean)
  const handleToggleStatus = (id: string) => {
    setProfiles((prevProfiles) =>
      prevProfiles.map((profile) =>
        profile.id === id ? { ...profile, isOnline: !profile.isOnline } : profile
      )
    );
    pushLog(`[UPDATE]: Toggled online status.`);
  };

  // Standard state update removing an item from the array
  const handleDeleteUser = (id: string, name: string) => {
    setProfiles((prevProfiles) => prevProfiles.filter((profile) => profile.id !== id));
    pushLog(`[DELETE]: Erased "${name}" from the database.`);
    
    // Safety check: if you delete yourself, log yourself out!
    if (activeSession && activeSession.username === name) {
      setActiveSession(null);
      pushLog("[AUTH]: Active session terminated because profile was deleted.");
    }
  };

  // Reads from the `useRef`. Notice how the UI didn't re-render as this number went up!
  const handleCheckNotepad = () => {
    alert(`Total background interaction clicks logged in notepad: ${totalClicksTracker.current}`);
  };

  // Determine which user data to show based on the active session.
  // We read from `optimisticProfiles` so the user sees the snappy, instant updates.
  const currentUserData = activeSession
    ? optimisticProfiles.find(p => p.id === activeSession.id)
    : null;

  return (
    /* CONCEPT: Context Provider
      Wrapping our app in `LogContext.Provider` makes the `pushLog` function
      available to any component nested inside of it, no matter how deep.
    */
    <LogContext.Provider value={pushLog}>
      <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "900px", margin: "0 auto" }}>
        
        {/* Conditional Rendering: Show login if no session, else show dashboard */}
        {!activeSession ? (
          <LoginForm
            profilesList={profiles}
            onLoginSuccess={(userObject) => setActiveSession(userObject)}
            onRegisterSuccess={(newProfile) => {
              setProfiles((prev) => [...prev, newProfile]);
              setActiveSession(newProfile);
            }}
          />
        ) : (
          <>
            <header style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1>Personal Dashboard</h1>
                <p style={{ color: "#007bff", fontWeight: "bold", margin: 0, fontSize: "1.1rem" }}>
                  Active Session: Welcome, {activeSession.username}
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={handleCheckNotepad} style={{ padding: "8px 12px", cursor: "pointer", backgroundColor: "#333", color: "white", border: "none", borderRadius: "4px" }}>
                  Inspect Interactions
                </button>
                <button onClick={() => { setActiveSession(null); pushLog("🔒 [AUTH]: User successfully logged out."); }} style={{ padding: "8px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                  Logout
                </button>
              </div>
            </header>

            <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", backgroundColor: "#f9f9f9", padding: "40px", border: "2px solid #ccc", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
              {currentUserData ? (
                <UserProfileCard
                  username={currentUserData.username}
                  role={currentUserData.role}
                  isOnline={currentUserData.isOnline}
                  messagesSent={currentUserData.messagesSent}
                >
                  <button onClick={() => handlePingUserAction(currentUserData.id)}
                  style={{ padding: "5px", cursor: "pointer", backgroundColor: "lightgreen", border: "1px solid black", borderRadius: "4px", fontWeight: "bold" }}>
                    Ping Self
                  </button>
                  <button onClick={() => handleToggleStatus(currentUserData.id)} style={{ padding: "5px", cursor: "pointer", backgroundColor: "#e2e8f0", border: "1px solid gray", borderRadius: "4px" }}>
                    Toggle My Status
                  </button>
                  <button onClick={() => handleDeleteUser(currentUserData.id, currentUserData.username)} style={{ padding: "5px", cursor: "pointer", backgroundColor: "#ffccd5", color: "#b70000", border: "1px solid #b70000", borderRadius: "4px", fontWeight: "bold" }}>
                    Delete Account
                  </button>
                </UserProfileCard>
              ) : (
                <p style={{ color: "red" }}>Error loading user data.</p>
              )}
            </div>
          </>
        )}

        {/* Live Logs Monitor rendering the `onScreenLogs` state array */}
        <div style={{ marginTop: "40px", backgroundColor: "#222", color: "#00ff00", padding: "20px", borderRadius: "8px", fontFamily: "monospace" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#fff", borderBottom: "1px solid #444", paddingBottom: "5px" }}>
            Live Monitor Logs:
          </h3>
          {onScreenLogs.map((logItem, index) => (
            <div key={index} style={{ marginBottom: "6px" }}>
              [{index + 1}] {logItem}
            </div>
          ))}
        </div>

      </div>
    </LogContext.Provider>
  );
}