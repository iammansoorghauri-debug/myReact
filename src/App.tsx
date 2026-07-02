// src/App.tsx
import React, { useEffect, useOptimistic, startTransition, Suspense } from "react";
import { createBrowserRouter, Outlet, useNavigate, useOutletContext, Link, Navigate, useSearchParams, useLoaderData } from "react-router";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { fakeDB } from "./lib/fakeDB";
import type { Profile } from "./lib/fakeDB";
import { loginAction } from "./actions/auth";
import { rootLoader, profileLoader } from "./loaders/routeLoaders";
import { useAppStore } from "./stores/appStore";

//-----------------------------------------------------------------

const LoginForm = React.lazy(() =>
  import("./components/LoginForm").then((module) => ({ default: module.LoginForm }))
);

const UserProfileCard = React.lazy(() =>
  import("./components/UserProfileCard").then((module) => ({ default: module.UserProfileCard }))
);


// Context type blueprint is now simplified strictly to local optimistic UI handling
export type AppContextType = {
  optimisticProfiles: Profile[];
  handlePingUserAction: (id: string) => void;
};

function RootStateLayout() {
  const loaderData = useLoaderData() as { activeSession: Profile | null, profiles: Profile[] };

  // Selectors to grab global data sync hooks and logs
  const profiles = useAppStore((state) => state.profiles);
  const onScreenLogs = useAppStore((state) => state.onScreenLogs);
  const setInitialData = useAppStore((state) => state.setInitialData);
  const pushLog = useAppStore((state) => state.pushLog);
  const incrementClicks = useAppStore((state) => state.incrementClicks);
  const syncProfilesAfterPing = useAppStore((state) => state.syncProfilesAfterPing);

  // Keep state synchronized with React Router Loaders
  useEffect(() => {
    setInitialData(loaderData.activeSession, loaderData.profiles);
  }, [loaderData, setInitialData]);

  useEffect(() => {
    pushLog("App mounted. System initialized.");
  }, [pushLog]);

  // Keep UX Optimistic hook bounded directly to the current state array slice
  const [optimisticProfiles, setOptimisticProfiles] = useOptimistic(
    profiles,
    (currentProfiles, idToUpdate: string) =>
      currentProfiles.map((profile) =>
        profile.id === idToUpdate ? { ...profile, messagesSent: profile.messagesSent + 1 } : profile
      )
  );

  const handlePingUserAction = (id: string) => {
    startTransition(async () => {
      incrementClicks();
      setOptimisticProfiles(id);
      pushLog(`[OPTIMISTIC]: UI instantly updated. Sending to database...`);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const dbProfile = fakeDB.profiles.find(p => p.id === id);
        if (dbProfile) {
          dbProfile.messagesSent += 1;
        }

        syncProfilesAfterPing(id);
        pushLog(`[SUCCESS]: Database successfully saved the ping!`);
      } catch (error) {
        pushLog(`[ERROR]: Network failed. Rolling back UI.`);
      }
    });
  };

  const contextValue: AppContextType = {
    optimisticProfiles,
    handlePingUserAction
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "900px", margin: "0 auto" }}>
      <Suspense fallback={<div style={{ padding: "30px", textAlign: "center", color: "#007bff", fontWeight: "bold", fontFamily: "monospace" }}>⚡ SECURING GATEWAY CHUNK...</div>}>
        <Outlet context={contextValue} />
      </Suspense>

      <div style={{ marginTop: "40px", backgroundColor: "#222", color: "#00ff00", padding: "20px", borderRadius: "8px", fontFamily: "monospace" }}>
        <h3 style={{ margin: "0 0 10px 0", color: "#fff", borderBottom: "1px solid #444", paddingBottom: "5px" }}>Live Monitor Logs:</h3>
        {onScreenLogs.map((logItem, index) => (
          <div key={index} style={{ marginBottom: "6px" }}>[{index + 1}] {logItem}</div>
        ))}
      </div>
    </div>
  );
}

function DashboardLayout() {
  const { optimisticProfiles } = useOutletContext<AppContextType>();
  
  // Zustand selectors replacing context extraction
  const activeSession = useAppStore((state) => state.activeSession);
  const totalClicks = useAppStore((state) => state.totalClicks);
  const handleLogout = useAppStore((state) => state.handleLogout);

  const [searchParams, setSearchParams] = useSearchParams();
  const roleQuery = searchParams.get("role") || "";

  const matchingProfiles = roleQuery
    ? optimisticProfiles.filter((p) => p.role.toLowerCase().includes(roleQuery.toLowerCase()))
    : [];

  const handleCheckNotepad = () => {
    alert(`Total background interaction clicks: ${totalClicks}`);
  };

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
  const activeSession = useAppStore((state) => state.activeSession);
  
  if (activeSession)
    return <Navigate to={`/dashboard/profile/${activeSession.id}`} replace />;

  return <LoginForm />;
}

function DashboardRedirector(){
  const activeSession = useAppStore((state) => state.activeSession);
  return <Navigate to={`/dashboard/profile/${activeSession?.id}`} replace />;
}

function ProfileDetail() {
  const loaderUser = useLoaderData() as Profile;
  
  const { optimisticProfiles, handlePingUserAction } = useOutletContext<AppContextType>();
  
  // Zustand selectors replacing layout layers
  const handleToggleStatus = useAppStore((state) => state.handleToggleStatus);
  const handleDeleteUser = useAppStore((state) => state.handleDeleteUser);
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
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "login", element: <LoginPageClean />, action: loginAction },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardRedirector /> },
          { path: "profile/:userId", element: <ProfileDetail />, loader: profileLoader }
        ]
      }
    ]
  }
]);