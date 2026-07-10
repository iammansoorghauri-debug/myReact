// src/components/PanelErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class PanelErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(" Layout Intercepted a Sub-route Crash:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
        return (
            <div
            style={{
                padding: "25px",
                backgroundColor: "#fff5f5",
                border: "1px solid #feb2b2",
                borderRadius: "6px",
                fontFamily: "monospace",
                color: "#c53030"
            }}
            >
            <h3 style={{ margin: "0 0 10px 0" }}>⚠️ Secure Panel Crash Intercepted</h3>
            <p style={{ margin: "0 0 15px 0", color: "#4a5568", fontSize: "14px", fontFamily: "sans-serif" }}>
                An unexpected scripting or data layout error occurred within this operational view. The rest of your control center remains functional.
            </p>
            {this.state.error && (
                <pre style={{
                padding: "10px",
                backgroundColor: "#fff",
                border: "1px solid #fed7d7",
                borderRadius: "4px",
                fontSize: "12px",
                overflowX: "auto",
                margin: "0 0 15px 0"
                }}>
                {this.state.error.toString()}
                </pre>
            )}
            <button
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{
                padding: "8px 14px",
                backgroundColor: "#c53030",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold"
                }}
            >
                Reset Panel View
            </button>
            </div>
        );
        }

    return this.props.children;
    }
}