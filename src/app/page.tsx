"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Loader2, MessageCircle } from "lucide-react";

export default function Home() {
  const [bio, setBio] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "waiting" | "matched">("idle");
  const [matchData, setMatchData] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Generate a session ID for the user
    const id = "user_" + Math.random().toString(36).substring(2, 9);
    setUserId(id);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status === "waiting") {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/status?userId=${userId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === "matched") {
              setMatchData(data);
              setStatus("matched");
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);
    }
    
    return () => clearInterval(interval);
  }, [status, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bio.trim().length < 20) {
      setError("Please write a bit more so we can find a good match.");
      return;
    }
    setError("");
    setStatus("loading");
    
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, userId }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      
      if (data.status === "matched") {
        setMatchData(data);
        setStatus("matched");
      } else {
        setStatus("waiting");
      }
    } catch (err: any) {
      setError(err.message);
      setStatus("idle");
    }
  };

  return (
    <main className="container">
      <h1 className="header-title">
        Find your <span className="text-gradient">Confluence</span>
      </h1>
      <p className="header-subtitle">
        Match with someone to talk 1:1 based on semantic overlap of what you're currently interested in.
      </p>

      {status === "idle" && (
        <div className="glass-panel">
          <form onSubmit={handleSubmit}>
            <label className="label">What are you currently reading or thinking about?</label>
            <textarea
              className="textarea-custom"
              placeholder="e.g. I just finished reading about the impact of artificial intelligence on modern art. I strongly believe AI cannot replace human creativity and want to debate this..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={status !== "idle"}
            />
            {error && <p style={{ color: "#ef4444", marginTop: "12px", fontSize: "0.9rem" }}>{error}</p>}
            
            <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="button-primary" disabled={bio.trim().length === 0}>
                Find a match <ArrowRight size={20} />
              </button>
            </div>
          </form>
        </div>
      )}

      {(status === "loading" || status === "waiting") && (
        <div className="glass-panel" style={{ textAlign: "center", padding: "64px 40px" }}>
          <Loader2 size={48} className="spinner text-gradient" style={{ margin: "0 auto", marginBottom: "24px" }} />
          <h2 style={{ fontSize: "1.5rem", marginBottom: "16px" }}>
            {status === "loading" ? "Analyzing your bio..." : "Waiting for a match..."}
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "400px", margin: "0 auto" }}>
            {status === "loading" 
              ? "We are extracting your topic and stance using AI."
              : "We've added you to the queue. You'll be matched as soon as someone with a complementary interest joins."}
          </p>
        </div>
      )}

      {status === "matched" && matchData && (
        <div className="glass-panel match-card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
            <div style={{ background: "rgba(168, 85, 247, 0.2)", padding: "12px", borderRadius: "50%" }}>
              <Sparkles size={24} color="#a855f7" />
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: "700" }}>Match Found!</h2>
          </div>

          <div className="user-info">
            <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>{matchData.partner.name}</h3>
            <p style={{ color: "var(--text-secondary)", fontStyle: "italic", marginBottom: "16px" }}>
              "{matchData.partner.bio}"
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              <span style={{ fontSize: "0.85rem", background: "rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: "99px" }}>
                Topic: {matchData.partner.topic}
              </span>
              <span style={{ fontSize: "0.85rem", background: "rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: "99px" }}>
                Stance: {matchData.partner.stance}
              </span>
            </div>
          </div>

          <div style={{ marginTop: "32px" }}>
            <h4 className="label">Why you were matched</h4>
            <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>{matchData.reason}</p>
          </div>

          <div className="icebreaker-box">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#a855f7" }}>
              <MessageCircle size={20} />
              <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Suggested Icebreaker</h4>
            </div>
            <p style={{ fontSize: "1.2rem", fontWeight: 500, margin: 0 }}>{matchData.icebreaker}</p>
          </div>
          
          <div style={{ marginTop: "32px", display: "flex", justifyContent: "center" }}>
            <button className="button-primary" onClick={() => {
              setBio("");
              setStatus("idle");
              setMatchData(null);
            }}>
              Start Another Search
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
