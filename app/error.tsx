"use client";

import { useEffect } from "react";

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1.5rem",
  padding: "2rem",
  background: "#0a0a0a",
  color: "#fafafa",
  fontFamily: "'Space Mono', monospace",
  textAlign: "center",
};

const heading: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const sub: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "#7a7a7a",
  maxWidth: "28rem",
};

const row: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
  justifyContent: "center",
};

const btn: React.CSSProperties = {
  padding: "0.6rem 1rem",
  background: "transparent",
  color: "#fafafa",
  border: "2px solid #fafafa",
  fontFamily: "'Space Mono', monospace",
  fontSize: "0.8rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  cursor: "pointer",
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const clearAndReload = () => {
    try {
      localStorage.removeItem("textfx_favs_v2");
    } catch {}
    location.reload();
  };

  return (
    <div style={wrap}>
      <h2 style={heading}>Something broke</h2>
      <p style={sub}>
        The app hit an unexpected error. Try again, or clear your saved data if
        it keeps happening.
      </p>
      <div style={row}>
        <button style={btn} onClick={() => reset()}>
          Try again
        </button>
        <button style={btn} onClick={clearAndReload}>
          Clear saved data &amp; reload
        </button>
      </div>
    </div>
  );
}
