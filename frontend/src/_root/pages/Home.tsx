import { useNavigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { User, Building2, ChevronRight, LogOut, GraduationCap, Shield } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex" }}>

      {/* LEFT CYAN STRIP */}
      <div style={{
        width: "6px", flexShrink: 0,
        // background: "linear-gradient(180deg, #00b4d8 0%, #009cd1 50%, #0077b6 100%)",
      }} />

      <div style={{ flex: 1, background: "#ffffff", display: "flex", flexDirection: "column" }}>

        {/* TOP BAR */}
        <div style={{
          background: "#fff", borderBottom: "1px solid #e2e8f0",
          padding: "0 32px", height: "60px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/assets/images/logo_test2.svg" alt="myIU" style={{ height: "55px" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Avatar + name */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "10px",
                background: "linear-gradient(135deg, #009cd1, #323393)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: "12px",
              }}>
                {initials}
              </div>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                {user?.name || "Unknown User"}
              </span>
            </div>

            <button
              onClick={() => (window.location.href = "/signout")}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "none", border: "1px solid #e2e8f0",
                borderRadius: "8px", padding: "6px 12px",
                color: "#09090B", fontSize: "12px", fontWeight: 500, cursor: "pointer",
              }}
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ width: "100%", maxWidth: "640px" }}>

            {/* WELCOME HEADER */}
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "16px", margin: "0 auto 16px",
                background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
                border: "1px solid #7dd3fc",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Shield size={24} color="#0284c7" />
              </div>
              <h1 style={{ color: "#0f172a", fontSize: "28px", fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
                Welcome back{user?.name ? `, ${user.name.split(" ").pop()}` : ""}!
              </h1>
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                Authenticated via Microsoft Identity Platform · Select a service to continue
              </p>
            </div>

            {/* CARDS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Profile card */}
              <button
                onClick={() => navigate("/profile")}
                style={{
                  background: "#fff", border: "1px solid #e2e8f0",
                  borderRadius: "16px", padding: "20px 24px",
                  display: "flex", alignItems: "center", gap: "16px",
                  cursor: "pointer", textAlign: "left", width: "100%",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  transition: "box-shadow 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#7dd3fc";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,156,209,0.1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                }}
              >
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
                  background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
                  border: "1px solid #7dd3fc",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <User size={20} color="#0284c7" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#0f172a", fontSize: "15px", fontWeight: 700, marginBottom: "3px" }}>
                    My Profile
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "12px" }}>
                    View identity details from Microsoft Graph API
                  </div>
                </div>
                <ChevronRight size={16} color="#cbd5e1" />
              </button>

              {/* Tenant card */}
              <button
                onClick={() => navigate("/tenant")}
                style={{
                  background: "#fff", border: "1px solid #e2e8f0",
                  borderRadius: "16px", padding: "20px 24px",
                  display: "flex", alignItems: "center", gap: "16px",
                  cursor: "pointer", textAlign: "left", width: "100%",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  transition: "box-shadow 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#a5b4fc";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(99,102,241,0.1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                }}
              >
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
                  background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                  border: "1px solid #a5b4fc",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Building2 size={20} color="#6366f1" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#0f172a", fontSize: "15px", fontWeight: 700, marginBottom: "3px" }}>
                    Tenant Information
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "12px" }}>
                    Azure Resource Manager · Microsoft Graph endpoint analysis
                  </div>
                </div>
                <ChevronRight size={16} color="#cbd5e1" />
              </button>

            </div>

            {/* FOOTER NOTE */}
            <p style={{ textAlign: "center", color: "#cbd5e1", fontSize: "11px", marginTop: "28px", fontFamily: "monospace" }}>
              HCMIU-VNU · Secure Session · Microsoft Entra ID
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
