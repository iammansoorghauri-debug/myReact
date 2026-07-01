// src/lib/fakeDB.ts
export interface Profile {
    id: string;
    username: string;
    password: string;
    role: string;
    isOnline: boolean;
    messagesSent: number;
}

export const fakeDB = {
    activeSession: null as Profile | null,
    profiles: [
        { id: "1", username: "mansoorghauri", password: "mansoor123", role: "Software Engineer", isOnline: true, messagesSent: 0 },
        { id: "2", username: "sarahodd", password: "sarah123", role: "UI Designer", isOnline: false, messagesSent: 0 }
    ]
};