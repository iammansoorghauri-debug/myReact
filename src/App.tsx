// src/App.tsx
import React, { useState, useEffect, createContext, useCallback, useRef, useOptimistic, startTransition, Suspense, useMemo } from "react";
import { createBrowserRouter, Outlet, useNavigate, useOutletContext, Link, Navigate, useSearchParams, useLoaderData } from "react-router";

import { ProtectedRoute } from "./components/ProtectedRoute";

import { fakeDB } from "./lib/fakeDB";
import type { Profile } from "./lib/fakeDB";
import { loginAction, logoutUser } from "./actions/auth";
import { rootLoader, profileLoader } from "./loaders/routeLoaders";

//-----------------------------------------------------------------

const LoginForm = React.lazy(() =>
  import("./components/LoginForm").then((module) => ({ default: module.LoginForm }))
);

const UserProfileCard = React.lazy(() =>
  import("./components/UserProfileCard").then((module) => ({ default: module.UserProfileCard }))
);

export const LogContext = createContext<((text: string) => void) | null>(null);

export type AppContextType = {
  activeSession: Profile | null;
  setActiveSession: (p: Profile | null) => void;
  optimisticProfiles: Profile[];
  handleRegisterUser: (newProfile: Profile) => void;
  handlePingUserAction: (id: string) => void;
  handleToggleStatus: (id: string) => void;
  handleDeleteUser: (id: string, name: string) => void;
  handleCheckNotepad: () => void;
  handleLogout: () => void;
};

function RootStateLayout() {
  const loaderData = useLoaderData() as { activeSession: Profile | null, profiles: Profile[] };

  const [activeSession, setActiveSession] = useState<Profile | null>(loaderData.activeSession);
  const [profiles, setProfiles] = useState<Profile[]>(loaderData.profiles);
  const [onScreenLogs, setOnScreenLogs] = useState<string[]>([]);
  const totalClicksTracker = useRef<number>(0);

  useEffect(() => {
    setActiveSession(loaderData.activeSession);
    setProfiles(loaderData.profiles);
  }, [loaderData]);

  const pushLog = useCallback((text: string) => setOnScreenLogs((prev) => [...prev, text]), []);

  useEffect(() => {
    pushLog("App mounted. System initialized.");
  }, []);

  const [optimisticProfiles, setOptimisticProfiles] = useOptimistic(
    profiles,
    (currentProfiles, idToUpdate: string) =>
      currentProfiles.map((profile) =>
        profile.id === idToUpdate ? { ...profile, messagesSent: profile.messagesSent + 1 } : profile
      )
  );

  const handleLogout = useCallback(() => {
    logoutUser(); // This clears the fakeDB database session
    setActiveSession(null); // This clears the React UI state
    pushLog("[AUTH]: Active session terminated. Redirecting to gateway...");
  }, [pushLog]);

  const handleRegisterUser = useCallback((newProfile: Profile) => {
    setProfiles((prev) => [...prev, newProfile]);
    setActiveSession(newProfile);
    pushLog(`[REGISTER SUCCESS]: Added "${newProfile.username}" to the core database state array.`);
  }, [pushLog]);

  const handlePingUserAction = useCallback((id: string) => {
    startTransition(async () => {
      totalClicksTracker.current += 1;
      setOptimisticProfiles(id);
      pushLog(`[OPTIMISTIC]: UI instantly updated. Sending to database...`);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const dbProfile = fakeDB.profiles.find(p => p.id === id);
        if (dbProfile) {
          dbProfile.messagesSent += 1;
        }

        setProfiles((prevProfiles) =>
          prevProfiles.map((profile) =>
            profile.id === id ? { ...profile, messagesSent: profile.messagesSent + 1 } : profile
          )
        );
        pushLog(`[SUCCESS]: Database successfully saved the ping!`);
      }
      catch (error) {
        pushLog(`[ERROR]: Network failed. Rolling back UI.`);
      }
    });
  }, [pushLog, setOptimisticProfiles]);

  const handleToggleStatus = useCallback((id: string) => {

    const dbProfile = fakeDB.profiles.find(p => p.id === id);
    if (dbProfile) {
      dbProfile.isOnline = !dbProfile.isOnline;
    }

    setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, isOnline: !p.isOnline } : p));
    pushLog(`[UPDATE]: Toggled online status.`);
  }, [pushLog]);

  const handleDeleteUser = useCallback((id: string, name: string) => {

    fakeDB.profiles = fakeDB.profiles.filter((p) => p.id !== id);

    setProfiles((prev) => prev.filter((p) => p.id !== id));
    pushLog(`[DELETE]: Erased "${name}" from the database.`);
    if (activeSession && activeSession.username === name) {
      setActiveSession(null);
      pushLog("[AUTH]: Active session terminated because profile was deleted.");
    }
  }, [pushLog, activeSession]);

  const handleCheckNotepad = () => {
    alert(`Total background interaction clicks: ${totalClicksTracker.current}`);
  };

  const contextValue: AppContextType = useMemo(() => ({
    activeSession,
    setActiveSession,
    optimisticProfiles,
    handleRegisterUser,
    handlePingUserAction,
    handleToggleStatus,
    handleDeleteUser,
    handleCheckNotepad,
    handleLogout
  }), [activeSession,
      optimisticProfiles,
      handleRegisterUser,
      handlePingUserAction,
      handleToggleStatus,
      handleDeleteUser,
      handleCheckNotepad,
      handleLogout]);

  return (
    <LogContext.Provider value={pushLog}>
      <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "900px", margin: "0 auto" }}>
        <Suspense fallback={<div style={{ padding: "30px", textAlign: "center", color: "#007bff",
          fontWeight: "bold", fontFamily: "monospace" }}>⚡ SECURING GATEWAY CHUNK...</div>}>
          <Outlet context={contextValue} />
        </Suspense>

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

function DashboardLayout() {
  // 💡 FIXED: Added handleLogout here to pull it out of the context hook safely!
  const { activeSession, handleCheckNotepad, optimisticProfiles, handleLogout } = useOutletContext<AppContextType>();
  const [searchParams, setSearchParams] = useSearchParams();
  const roleQuery = searchParams.get("role") || "";

  const matchingProfiles = roleQuery
    ? optimisticProfiles.filter((p) => p.role.toLowerCase().includes(roleQuery.toLowerCase()))
    : [];

  return (
    <>
      <header style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #eee", paddingBottom: "20px" }}>
        <div>
          <h1>System Control Center</h1>
          <p style={{ color: "#007bff", fontWeight: "bold", margin: 0 }}>
            Welcome, {activeSession?.username}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleCheckNotepad} style={{ padding: "8px 12px", cursor: "pointer", backgroundColor: "#333", color: "white", border: "none", borderRadius: "4px" }}>
            Inspect Notepad
          </button>
          <Link to="/login" onClick={handleLogout} style={{ padding: "8px 12px", backgroundColor: "#dc3545", color: "white", textDecoration: "none", borderRadius: "4px", fontWeight: "bold" }}>
            Logout
          </Link>
        </div>
      </header>

      <div style={{ marginBottom: "25px", padding: "15px", backgroundColor: "#f1f5f9", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
        <h4 style={{ margin: "0 0 10px 0", color: "#334155" }}>Global Role Presence Query</h4>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Type a role to verify existence..."
            value={roleQuery}
            onChange={(e) => { const query = e.target.value;
              if (query)
                setSearchParams({ role: query });
              else
                setSearchParams({});
            }}
            style={{ padding: "10px", flex: 1, borderRadius: "6px", border: "1px solid #94a3b8", fontSize: "14px" }}
          />
        </div>

        {roleQuery && (
          <div style={{ marginTop: "12px", fontSize: "14px", fontFamily: "monospace" }}>
            {matchingProfiles.length > 0 ? (
              <div style={{ color: "#16a34a", fontWeight: "bold" }}>
                Status: Active users match this descriptor! <br />
                <span style={{ color: "#475569", fontWeight: "normal" }}>Matches: {matchingProfiles.map(p => `${p.username} [${p.role}]`).join(", ")}</span>
              </div>
            ) : (
              <div style={{ color: "#dc2626", fontWeight: "bold" }}>Status: No active profiles found matching "{roleQuery}"</div>
            )}
          </div>
        )}
      </div>

      <div style={{ backgroundColor: "#f9f9f9", padding: "40px", border: "2px solid #ccc", borderRadius: "8px" }}>
        <Suspense fallback={<div style={{ padding: "15px", color: "#555", fontFamily: "monospace", textAlign: "center" }}>⚙️ LOADING SECURE PANEL...</div>}>
          <Outlet context={useOutletContext<AppContextType>()} />
        </Suspense>
      </div>
    </>
  );
}

function LoginPageClean() {
  const { activeSession } = useOutletContext<AppContextType>();
  
  if (activeSession)
    return <Navigate to={`/dashboard/profile/${activeSession.id}`} replace />;

  return <LoginForm />;
}

function DashboardRedirector(){
  const { activeSession } = useOutletContext<AppContextType>();
  return <Navigate to={`/dashboard/profile/${activeSession?.id}`} replace />;
}

function ProfileDetail() {
  const loaderUser = useLoaderData() as Profile;
  
  const { optimisticProfiles, handlePingUserAction, handleToggleStatus, handleDeleteUser } = useOutletContext<AppContextType>();
  const navigate = useNavigate();

  const targetUser = optimisticProfiles.find((p) => p.id === loaderUser.id) || loaderUser;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <UserProfileCard
        username={targetUser.username}
        role={targetUser.role}
        isOnline={targetUser.isOnline}
        messagesSent={targetUser.messagesSent}>
        <button onClick={() => handlePingUserAction(targetUser.id)} style={{ padding: "5px", cursor: "pointer", backgroundColor: "lightgreen", border: "1px solid black", borderRadius: "4px", fontWeight: "bold" }}>
          Ping User
        </button>
        <button onClick={() => handleToggleStatus(targetUser.id)} style={{ padding: "5px", cursor: "pointer", backgroundColor: "#e2e8f0", border: "1px solid gray", borderRadius: "4px" }}>
          Toggle Status
        </button>
        <button onClick={() => {handleDeleteUser(targetUser.id, targetUser.username);
          navigate("/login");
        }} style={{ padding: "5px", cursor: "pointer", backgroundColor: "#ffccd5", color: "#b70000", border: "1px solid #b70000", borderRadius: "4px", fontWeight: "bold" }}>
          Delete Account
        </button>
      </UserProfileCard>
    </div>
  );
}

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <RootStateLayout />,
    loader: rootLoader,
    children: [
      { index: true,
        element: <Navigate to="/login" replace />
      },
      {
        path: "login",
        element: <LoginPageClean />,
        action: loginAction
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true,
            element: <DashboardRedirector /> },
          {
            path: "profile/:userId",
            element: <ProfileDetail />,
            loader: profileLoader
          }
        ]
      }
    ]
  }
]);