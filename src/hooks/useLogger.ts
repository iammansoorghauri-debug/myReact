// src/hooks/useLogger.ts
import { useState, useEffect } from "react";

export function useLogger() {
    const [logs, setLogs] = useState<string[]>([]);

    const pushLog = (text: string) => {
        setLogs((currentLogs) => [...currentLogs, text]);
    };

    useEffect(() => {
        pushLog("🚀 Custom Hook Engine initialized and watching successfully!");
    }, []);

    return { logs, pushLog };
}