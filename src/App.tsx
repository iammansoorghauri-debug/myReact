// src/App.tsx
import React, { useState, useEffect, createContext, useRef, useOptimistic, startTransition } from "react";
// We are using modern React Router features for handling layouts, parameters, and query search strings
import { createBrowserRouter, Outlet, useNavigate, useParams, useOutletContext, Link, Navigate, useSearchParams } from "react-router";

// Import isolated sub-components
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginForm } from "./components/LoginForm";
import { UserProfileCard } from "./components/UserProfileCard";

/**
 * 💡 TYPE EXPORTS
 * We explicitly use 'export' here so sub-components can grab these types.
 * Remember: When importing these in other files, use 'import type' so Vite knows they are pure TS blueprints!
 */
export interface Profile {
  id: string;
  username: string;
  password: string;
  role: string;
  isOnline: boolean;
  messagesSent: number;
}

// Global Context strictly for passing down the terminal logging function down the tree without prop-drilling
export const LogContext = createContext<((text: string) => void) | null>(null);

// The blueprint structure for the data we share down through React Router's <Outlet context={...} />
export type AppContextType = {
  activeSession: Profile | null;
  setActiveSession: (p: Profile | null) => void;
  optimisticProfiles: Profile[];
  handleRegisterUser: (newProfile: Profile) => void;
  handlePingUserAction: (id: string) => void;
  handleToggleStatus: (id: string) => void;
  handleDeleteUser: (id: string, name: string) => void;
  handleCheckNotepad: () => void;
};

/**
 * 🪐 1. ROOT STATE LAYOUT
 * This is the ultimate parent component. It holds the core master state array ("database")
 * and acts as the provider wrapper for layout wrappers and logs.
 */
function RootStateLayout() {
  // Authentication session state tracker (null means logged out)
  const [activeSession, setActiveSession] = useState<Profile | null>(null);
  
  // Core "Database" State array holding our hardcoded starter user profiles
  const [profiles, setProfiles] = useState<Profile[]>([
    { id: "1", username: "mansoorghauri", password: "mansoor123", role: "Software Engineer", isOnline: true, messagesSent: 0 },
    { id: "2", username: "sarahodd", password: "sarah123", role: "UI Designer", isOnline: false, messagesSent: 0 }
  ]);
  
  // State for managing the green terminal display logs at the bottom of the screen
  const [onScreenLogs, setOnScreenLogs] = useState<string[]>([]);
  
  // useRef tracks data silently in the background. Changing .current does NOT trigger a component re-render!
  const totalClicksTracker = useRef<number>(0);

  // Helper utility function to push a new entry onto our terminal logs array
  const pushLog = (text: string) => setOnScreenLogs((prev) => [...prev, text]);

  // Runs exactly once when the application boots up
  useEffect(() => {
    pushLog("App mounted. System initialized.");
  }, []);

  /**
   * 🔥 REACT 19 FEATURE: useOptimistic
   * This hook takes the real master state ('profiles') and instantly tricks the UI into 
   * rendering update changes before the asynchronous "server network requests" complete.
   */
  const [optimisticProfiles, setOptimisticProfiles] = useOptimistic(
    profiles,
    (currentProfiles, idToUpdate: string) =>
      currentProfiles.map((profile) =>
        // If the ID matches, bump the message count immediately in the UI view
        profile.id === idToUpdate ? { ...profile, messagesSent: profile.messagesSent + 1 } : profile
      )
  );

  // Handler for adding a newly registered user to our simulated core database state
  const handleRegisterUser = (newProfile: Profile) => {
    setProfiles((prev) => [...prev, newProfile]);
    setActiveSession(newProfile); // Auto-login the user upon registration
    pushLog(`[REGISTER SUCCESS]: Added "${newProfile.username}" to the core database state array.`);
  };

  // Handler demonstrating asynchronous actions alongside Optimistic UI updates
  const handlePingUserAction = (id: string) => {
    // React 19 rule: useOptimistic MUST be invoked inside a transition wrapper block
    startTransition(async () => {
      totalClicksTracker.current += 1; // Increment background ref safely without re-rendering
      setOptimisticProfiles(id);       // Instantly update UI numbers using our optimistic hook rule
      pushLog(`[OPTIMISTIC]: UI instantly updated. Sending to database...`);
      
      try {
        // Simulate a 1.5-second network database delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // After network resolves successfully, save the permanent state update
        setProfiles((prevProfiles) =>
          prevProfiles.map((profile) =>
            profile.id === id ? { ...profile, messagesSent: profile.messagesSent + 1 } : profile
          )
        );
        pushLog(`[SUCCESS]: Database successfully saved the ping!`);
      }
      catch (error) {
        // If this block threw an error, useOptimistic would automatically rollback the UI count on its own!
        pushLog(`[ERROR]: Network failed. Rolling back UI.`);
      }
    });
  };

  // Toggles online status boolean values inside state arrays
  const handleToggleStatus = (id: string) => {
    setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, isOnline: !p.isOnline } : p));
    pushLog(`[UPDATE]: Toggled online status.`);
  };

  // Erases profiles from local master arrays and forces logout if deleting yourself
  const handleDeleteUser = (id: string, name: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    pushLog(`[DELETE]: Erased "${name}" from the database.`);
    
    if (activeSession && activeSession.username === name) {
      setActiveSession(null); // Boot user out to login screen if they delete themselves
      pushLog("[AUTH]: Active session terminated because profile was deleted.");
    }
  };

  // Inspect counter alert triggered using standard browser windows
  const handleCheckNotepad = () => {
    alert(`Total background interaction clicks: ${totalClicksTracker.current}`);
  };

  // Packing all our states and methods into one master object to pass down the router context
  const contextValue: AppContextType = {
    activeSession,
    setActiveSession,
    optimisticProfiles,
    handleRegisterUser,
    handlePingUserAction,
    handleToggleStatus,
    handleDeleteUser,
    handleCheckNotepad
  };

  return (
    <LogContext.Provider value={pushLog}>
      <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "900px", margin: "0 auto" }}>
        
        {/* <Outlet /> is where React Router injects matching child components based on URLs */}
        <Outlet context={contextValue} />

        {/* Global Live Monitor Logging Terminal UI component layout wrapper */}
        <div style={{ marginTop: "40px", backgroundColor: "#222", color: "#00ff00", padding: "20px", borderRadius: "8px", fontFamily: "monospace" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#fff", borderBottom: "1px solid #444", paddingBottom: "5px" }}>Live Monitor Logs:</h3>
          {onScreenLogs.map((logItem, index) => (
            <div key={index} style={{ marginBottom: "6px" }}>[{index + 1}] {logItem}</div>
          ))}
        </div>
      </div>
    </LogContext.Provider>
  );
}

/**
 * 🖥️ 2. DASHBOARD LAYOUT
 * Wrapped inside <ProtectedRoute>. It parses search query values from the live URL 
 * and handles live sorting/filtering of data.
 */
function DashboardLayout() {
  // Extracting our states passed down from RootStateLayout via React Router context hooks
  const { activeSession, setActiveSession, handleCheckNotepad, optimisticProfiles } = useOutletContext<AppContextType>();
  
  // useSearchParams manages URL query strings like "?role=engineer"
  const [searchParams, setSearchParams] = useSearchParams();
  const roleQuery = searchParams.get("role") || ""; // Pull what was typed, fallback to empty string if null

  // Live Engine: Evaluates profile values matches against current queries case-insensitively
  const matchingProfiles = roleQuery
    ? optimisticProfiles.filter((p) => p.role.toLowerCase().includes(roleQuery.toLowerCase()))
    : [];

  return (
    <>
      <header style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #eee", paddingBottom: "20px" }}>
        <div>
          <h1>System Control Center</h1>
          {/* 🛠️ FIXED HERE: 'fontWeight' is explicitly camelCase. Added '?' optional chaining to prevent crash states */}
          <p style={{ color: "#007bff", fontWeight: "bold", margin: 0 }}>
            Welcome, {activeSession?.username}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleCheckNotepad} style={{ padding: "8px 12px", cursor: "pointer", backgroundColor: "#333", color: "white", border: "none", borderRadius: "4px" }}>
            Inspect Notepad
          </button>
          <Link to="/login" onClick={() => setActiveSession(null)} style={{ padding: "8px 12px", backgroundColor: "#dc3545", color: "white", textDecoration: "none", borderRadius: "4px", fontWeight: "bold" }}>
            Logout
          </Link>
        </div>
      </header>

      {/* SEARCH SYSTEM INTERFACE */}
      <div style={{ marginBottom: "25px", padding: "15px", backgroundColor: "#f1f5f9", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
        <h4 style={{ margin: "0 0 10px 0", color: "#334155" }}>🔍 Global Role Presence Query</h4>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Type a role to verify existence..."
            value={roleQuery} // Controlled component reflecting current URL parameter state directly
            onChange={(e) => {
              const query = e.target.value;
              if (query) setSearchParams({ role: query }); // Update URL to ?role=yourText
              else setSearchParams({});                  // Wipe queries clean out of URLs if text boxes are cleared
            }}
            style={{ padding: "10px", flex: 1, borderRadius: "6px", border: "1px solid #94a3b8", fontSize: "14px" }}
          />
        </div>
        
        {/* Dynamic Display results based on current user entries */}
        {roleQuery && (
          <div style={{ marginTop: "12px", fontSize: "14px", fontFamily: "monospace" }}>
            {matchingProfiles.length > 0 ? (
              <div style={{ color: "#16a34a", fontWeight: "bold" }}>
                ✅ Status: Active users match this descriptor! <br />
                <span style={{ color: "#475569", fontWeight: "normal" }}>Matches: {matchingProfiles.map(p => `${p.username} [${p.role}]`).join(", ")}</span>
              </div>
            ) : (
              <div style={{ color: "#dc2626", fontWeight: "bold" }}>❌ Status: No active profiles found matching "{roleQuery}"</div>
            )}
          </div>
        )}
      </div>

      {/* Sub-Dashboard Area where child routes are dynamically injected */}
      <div style={{ backgroundColor: "#f9f9f9", padding: "40px", border: "2px solid #ccc", borderRadius: "8px" }}>
        <Outlet context={useOutletContext<AppContextType>()} />
      </div>
    </>
  );
}

/**
 * 🔒 3. LOGIN PAGE CLEAN
 * Serves authentication entry routes. Protects users from re-viewing logins if active.
 */
function LoginPageClean() {
  const { activeSession, setActiveSession, optimisticProfiles, handleRegisterUser } = useOutletContext<AppContextType>();
  const navigate = useNavigate();

  // If already logged in, instantly intercept traffic and kick them down to their dashboard profile route
  if (activeSession) return <Navigate to={`/dashboard/profile/${activeSession.id}`} replace />;

  return (
    <LoginForm
      profilesList={optimisticProfiles}
      onLoginSuccess={(userObject: Profile) => {
        setActiveSession(userObject);
        navigate(`/dashboard/profile/${userObject.id}`);
      }}
      onRegisterSuccess={(newProfile: Profile) => {
        handleRegisterUser(newProfile);
        navigate(`/dashboard/profile/${newProfile.id}`);
      }}
    />
  );
}

/**
 * 🔀 4. DASHBOARD REDIRECTOR
 * Small fall-through utility redirecting base routes `/dashboard` to specific sub-routes `/dashboard/profile/:id`
 */
function DashboardRedirector() {
  const { activeSession } = useOutletContext<AppContextType>();
  return <Navigate to={`/dashboard/profile/${activeSession?.id}`} replace />;
}

/**
 * 👤 5. PROFILE DETAIL COMPONENT
 * Renders individual specific data profiles dynamically from URL parameters.
 */
function ProfileDetail() {
  const { userId } = useParams(); // Extracts the ':userId' directly out of the active URL string path
  const { activeSession, optimisticProfiles, handlePingUserAction, handleToggleStatus, handleDeleteUser } = useOutletContext<AppContextType>();
  const navigate = useNavigate();

  // Route security guard: Don't let users snoop and look at paths belonging to other user profile IDs
  if (activeSession && userId !== activeSession.id) {
    return <Navigate to={`/dashboard/profile/${activeSession.id}`} replace />;
  }

  // Locates the corresponding user profile matching our current URL path param
  const targetUser = optimisticProfiles.find(p => p.id === userId);

  if (!targetUser) return <p style={{ color: "red" }}>Error: Profile not found.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <UserProfileCard username={targetUser.username} role={targetUser.role} isOnline={targetUser.isOnline} messagesSent={targetUser.messagesSent}>
        
        {/* Child actionable control elements injected down directly into cards */}
        <button onClick={() => handlePingUserAction(targetUser.id)} style={{ padding: "5px", cursor: "pointer", backgroundColor: "lightgreen", border: "1px solid black", borderRadius: "4px", fontWeight: "bold" }}>
          Ping User
        </button>
        <button onClick={() => handleToggleStatus(targetUser.id)} style={{ padding: "5px", cursor: "pointer", backgroundColor: "#e2e8f0", border: "1px solid gray", borderRadius: "4px" }}>
          Toggle Status
        </button>
        <button onClick={() => {
          handleDeleteUser(targetUser.id, targetUser.username);
          navigate("/login");
        }} style={{ padding: "5px", cursor: "pointer", backgroundColor: "#ffccd5", color: "#b70000", border: "1px solid #b70000", borderRadius: "4px", fontWeight: "bold" }}>
          Delete Account
        </button>
        
      </UserProfileCard>
    </div>
  );
}

/**
 * 🗺️ 6. THE GRAND ROUTER DEFINITION
 * Defines all URL endpoints and structured hierarchies for layouts across the application workspace.
 */
export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <RootStateLayout />, // Root State surrounds EVERYTHING
    children: [
      { index: true, element: <Navigate to="/login" replace /> }, // Auto redirect root paths home to logins
      { path: "login", element: <LoginPageClean /> },
      {
        path: "dashboard",
        element: (
          // Protected Route wraps the entire Dashboard view structure
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardRedirector /> }, // Redirects bare /dashboard requests to profile ids
          { path: "profile/:userId", element: <ProfileDetail /> } // Dynamic structural nested route profile page mapping
        ]
      }
    ]
  }
]);