// src/App.tsx
import { useState, useEffect, createContext, useRef } from "react";
import { UserProfileCard } from "./components/UserProfileCard";

interface Profile {
  id: string;
  username: string;
  role: string;
  isOnline: boolean;
  messagesSent: number;
}

export const LogContext = createContext<((text: string) => void) | null>(null);

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>([
    { id: "1", username: "mansoorghauri", role: "Software Engineer", isOnline: true, messagesSent: 0 },
    { id: "2", username: "sarahodd", role: "UI Designer", isOnline: false, messagesSent: 0 }
  ]);

  const [formData, setFormData] = useState({
    username: "",
    role: ""
  });
  // for errors
  const [formErrors, setFormErrors] = useState({
  username: "",
  role: ""
});

  const [onScreenLogs, setOnScreenLogs] = useState<string[]>([]);
  const totalClicksTracker = useRef<number>(0);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const pushLog = (text: string) => {
    setOnScreenLogs((currentLogs) => [...currentLogs, text]);
  };

  useEffect(() => {
    pushLog("🚀 EFFECT 1 triggered: Webpage loaded completely for the first time!");
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    


    // --- START OF VALIDATION BOUNCER ---
    // Create a temporary object to hold any errors we find
    let errorsFound = { username: "", role: "" };
    let isDataValid = true;

    // Rule 1 & 2: Username checks
    if (formData.username.trim().length < 3){
      errorsFound.username = "Username must be at least 3 characters long.";
      isDataValid = false;
    }
    else if (formData.username.includes(" ")){
      errorsFound.username = "Username cannot contain spaces.";
      isDataValid = false;
    }

    // Rule 3: Role check
    if (!formData.role.trim()){
      errorsFound.role = "Please provide a job role.";
      isDataValid = false;
    }

    // Update our React state so the UI shows the red text (if any)
    setFormErrors(errorsFound);

    // If the bouncer found errors, STOP right here. Do not create the card.
    if (!isDataValid) {
      pushLog("⚠️ [ERROR]: Profile creation blocked due to invalid data.");
      return;
    }
    // --- END OF VALIDATION BOUNCER ---

    const newProfile: Profile = {
      id: Date.now().toString(),
      username: formData.username,
      role: formData.role,
      isOnline: true,
      messagesSent: 0
    };

    setProfiles((prev) => [...prev, newProfile]);
    pushLog(`[CREATE]: Added new profile for "${formData.username}"`);

    setFormData({ username: "", role: "" });
  };

  const handlePingUser = (id: string, name: string) => {
    totalClicksTracker.current += 1;
    setProfiles((prevProfiles) =>
      prevProfiles.map((profile) =>
        profile.id === id ? { ...profile, messagesSent: profile.messagesSent + 1 } : profile
      )
    );
    pushLog(`[UPDATE]: Pinged user "${name}"`);
  };

  const handleToggleStatus = (id: string, name: string) => {
    setProfiles((prevProfiles) =>
      prevProfiles.map((profile) =>
        profile.id === id ? { ...profile, isOnline: !profile.isOnline } : profile
      )
    );
    pushLog(`[UPDATE]: Toggled status for "${name}"`);
  };

  const handleDeleteUser = (id: string, name: string) => {
    setProfiles((prevProfiles) => prevProfiles.filter((profile) => profile.id !== id));
    pushLog(`[DELETE]: Erased "${name}" from the application state.`);
  };

  const handleFocusInput = () => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
      messageInputRef.current.style.backgroundColor = "#fffde7";
      pushLog("Ref Action: Physically focused input element via useRef pointer!");
    }
  };

  const handleCheckNotepad = () => {
    alert(`Total background interaction clicks logged in notepad: ${totalClicksTracker.current}`);
  };

  return (
    <LogContext.Provider value={pushLog}>
      <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "900px", margin: "0 auto" }}>
        
        <header style={{ marginBottom: "20px" }}>
          <h1>Full Profile CRUD Dashboard</h1>
          <p style={{ color: "#666" }}>Add, edit, ping, or destroy profiles live using reactive architecture.</p>
        </header>

        <div style={{ backgroundColor: "#f0f4f8", padding: "20px", borderRadius: "8px", marginBottom: "25px" }}>
          <form onSubmit={handleCreateProfile} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
  
            {/* Username Section */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                ref={messageInputRef}
                type="text"
                name="username"
                placeholder="Username..."
                value={formData.username}
                onChange={handleInputChange}
                // Give it a red border if there is an error!
                style={{ padding: "10px", border: formErrors.username ? "2px solid red" : "1px solid #ccc", borderRadius: "4px" }}
              />
              {/* If formErrors.username has text, display this red span */}
              {formErrors.username && (
                <span style={{ color: "red", fontSize: "0.85rem", marginTop: "4px", fontWeight: "bold" }}>
                  {formErrors.username}
                </span>
              )}
            </div>
            
            {/* Role Section */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                type="text"
                name="role"
                placeholder="Job Role..."
                value={formData.role}
                onChange={handleInputChange}
                style={{ padding: "10px", border: formErrors.role ? "2px solid red" : "1px solid #ccc", borderRadius: "4px" }}
              />
              {formErrors.role && (
                <span style={{ color: "red", fontSize: "0.85rem", marginTop: "4px", fontWeight: "bold" }}>
                  {formErrors.role}
                </span>
              )}
            </div>
            
            <button type="submit" style={{ padding: "10px 15px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", width: "150px" }}>
              Create Card
            </button>
          </form>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleFocusInput} style={{ padding: "8px 12px", cursor: "pointer", fontWeight: "bold", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}>
              Focus Username Field
            </button>
            <button onClick={handleCheckNotepad} style={{ padding: "8px 12px", cursor: "pointer", backgroundColor: "#333", color: "white", border: "none", borderRadius: "4px" }}>
              Inspect Total Pings Notepad
            </button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", backgroundColor: "#f9f9f9", padding: "20px", border: "2px solid #ccc", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
          
          {profiles.length === 0 && <p style={{ color: "#777", fontWeight: "bold" }}>No profiles exist right now. Create one above!</p>}

          {profiles.map((user) => (
            <UserProfileCard
              key={user.id}
              username={user.username}
              role={user.role}
              isOnline={user.isOnline}
              messagesSent={user.messagesSent}
            >
              <button onClick={() => handlePingUser(user.id, user.username)} style={{ padding: "5px", cursor: "pointer", backgroundColor: "lightgreen", border: "1px solid black", borderRadius: "4px", fontWeight: "bold" }}>
                Ping {user.username}
              </button>
              
              <button onClick={() => handleToggleStatus(user.id, user.username)} style={{ padding: "5px", cursor: "pointer", backgroundColor: "#e2e8f0", border: "1px solid gray", borderRadius: "4px" }}>
                Toggle Status
              </button>

              <button onClick={() => handleDeleteUser(user.id, user.username)} style={{ padding: "5px", cursor: "pointer", backgroundColor: "#ffccd5", color: "#b70000", border: "1px solid #b70000", borderRadius: "4px", fontWeight: "bold" }}>
                Delete Profile
              </button>
            </UserProfileCard>
          ))}

        </div>

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