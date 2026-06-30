// src/App.tsx
import { useState, useEffect, createContext, useRef, useOptimistic, startTransition } from "react";
import { createBrowserRouter, Outlet, useNavigate, useParams, useOutletContext, Link, Navigate } from "react-router";
import { UserProfileCard } from "./components/UserProfileCard";
import { LoginForm } from "./components/LoginForm";

interface Profile {
  id: string;
  username: string;
  password: string;
  role: string;
  isOnline: boolean;
  messagesSent: number;
}

export const LogContext = createContext<((text: string) => void) | null>(null);

type AppContextType = {
  activeSession: Profile | null;
  setActiveSession: (p: Profile | null) => void;
  optimisticProfiles: Profile[];
  handleRegisterUser: (newProfile: Profile) => void;
  handlePingUserAction: (id: string) => void;
  handleToggleStatus: (id: string) => void;
  handleDeleteUser: (id: string, name: string) => void;
  handleCheckNotepad: () => void;
};

function RootStateLayout() {
  const [activeSession, setActiveSession] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([
    { id: "1", username: "mansoorghauri", password: "mansoor123", role: "Software Engineer", isOnline: true, messagesSent: 0 },
    { id: "2", username: "sarahodd", password: "sarah123", role: "UI Designer", isOnline: false, messagesSent: 0 }
  ]);
  const [onScreenLogs, setOnScreenLogs] = useState<string[]>([]);
  const totalClicksTracker = useRef<number>(0);

  const pushLog = (text: string) => setOnScreenLogs((prev) => [...prev, text]);

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

  const handleRegisterUser = (newProfile: Profile) => {
    setProfiles((prev) => [...prev, newProfile]);
    setActiveSession(newProfile);
    pushLog(`[REGISTER SUCCESS]: Added "${newProfile.username}" to the core database state array.`);
  };

  const handlePingUserAction = (id: string) => {
    startTransition(async () => {
      totalClicksTracker.current += 1;
      setOptimisticProfiles(id);
      pushLog(`[OPTIMISTIC]: UI instantly updated. Sending to database...`);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
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
  };

  const handleToggleStatus = (id: string) => {
    setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, isOnline: !p.isOnline } : p));
    pushLog(`[UPDATE]: Toggled online status.`);
  };

  const handleDeleteUser = (id: string, name: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    pushLog(`[DELETE]: Erased "${name}" from the database.`);
    if (activeSession && activeSession.username === name) {
      setActiveSession(null);
      pushLog("[AUTH]: Active session terminated because profile was deleted.");
    }
  };

  const handleCheckNotepad = () => {
    alert(`Total background interaction clicks: ${totalClicksTracker.current}`);
  };

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
        
        <Outlet context={contextValue} />

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


function LoginPageClean() {
  const { activeSession, setActiveSession, optimisticProfiles, handleRegisterUser } = useOutletContext<AppContextType>();
  const navigate = useNavigate();

  if (activeSession)
    return <Navigate to={`/dashboard/profile/${activeSession.id}`} replace />;

  return (
    <LoginForm
      profilesList={optimisticProfiles}
      onLoginSuccess={(userObject) => {
        setActiveSession(userObject);
        navigate(`/dashboard/profile/${userObject.id}`);
      }}
      onRegisterSuccess={(newProfile) => {
        handleRegisterUser(newProfile);
        navigate(`/dashboard/profile/${newProfile.id}`);
      }}
    />
  );
}

function DashboardLayout() {
  const { activeSession, setActiveSession, handleCheckNotepad } = useOutletContext<AppContextType>();
  
  if (!activeSession)
    return <Navigate to="/login" replace />;

  return (
    <>
      <header style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #eee", paddingBottom: "20px" }}>
        <div>
          <h1>System Control Center</h1>
          <p style={{ color: "#007bff", fontWeight: "bold", margin: 0 }}>
            Welcome, {activeSession.username}
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

      <div style={{ backgroundColor: "#f9f9f9", padding: "40px", border: "2px solid #ccc", borderRadius: "8px" }}>
        <Outlet context={useOutletContext<AppContextType>()} />
      </div>
    </>
  );
}

function DashboardRedirector() {
  const { activeSession } = useOutletContext<AppContextType>();
  if (!activeSession)
    return <Navigate to="/login" replace />;
  return <Navigate to={`/dashboard/profile/${activeSession.id}`} replace />;
}

function ProfileDetail() {
  const { userId } = useParams();
  const { activeSession, optimisticProfiles, handlePingUserAction, handleToggleStatus, handleDeleteUser } = useOutletContext<AppContextType>();
  const navigate = useNavigate();


  if (activeSession && userId !== activeSession.id) {
    return <Navigate to={`/dashboard/profile/${activeSession.id}`} replace />;
  }

  const targetUser = optimisticProfiles.find(p => p.id === userId);

  if (!targetUser)
    return <p style={{ color: "red" }}>Error: Profile not found.</p>;

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

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <RootStateLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />
      },
      {
        path: "login",
        element: <LoginPageClean />
      },
      {
        path: "dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardRedirector />
          },
          {
            path: "profile/:userId",
            element: <ProfileDetail />
          }
        ]
      }
    ]
  }
]);