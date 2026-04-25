import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CargoPlus - Source from China. Ship to Canada.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2d0f6b 0%, #1e0a4a 60%, #150736 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative circles */}
        <div style={{
          position: "absolute", top: -120, right: -120,
          width: 500, height: 500, borderRadius: "50%",
          background: "rgba(212,175,55,0.08)", display: "flex",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -80,
          width: 350, height: 350, borderRadius: "50%",
          background: "rgba(212,175,55,0.06)", display: "flex",
        }} />

        {/* Gold top accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 6, background: "linear-gradient(90deg, #D4AF37, #f0d060, #D4AF37)",
          display: "flex",
        }} />

        {/* Main content */}
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 24,
        }}>
          {/* Brand name */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}>
            <div style={{
              fontSize: 80, fontWeight: 900, color: "#D4AF37",
              letterSpacing: "-2px", lineHeight: 1,
              textShadow: "0 4px 20px rgba(212,175,55,0.4)",
            }}>
              Shanghai CargoPlus
            </div>
            {/* Gold underline */}
            <div style={{
              width: 600, height: 3,
              background: "linear-gradient(90deg, transparent, #D4AF37, transparent)",
              display: "flex",
            }} />
          </div>

          {/* Tagline */}
          <div style={{
            fontSize: 32, color: "rgba(255,255,255,0.85)",
            fontWeight: 500, letterSpacing: "1px", marginTop: 8,
          }}>
            Source from China · Ship to Canada
          </div>

          {/* Service pills */}
          <div style={{
            display: "flex", gap: 16, marginTop: 16,
          }}>
            {["Consolidation & RFQ", "Engineering Projects", "Direct Sourcing"].map((label) => (
              <div key={label} style={{
                padding: "10px 24px",
                border: "1px solid rgba(212,175,55,0.5)",
                borderRadius: 100,
                color: "#D4AF37",
                fontSize: 20,
                fontWeight: 600,
                background: "rgba(212,175,55,0.1)",
                display: "flex",
              }}>
                {label}
              </div>
            ))}
          </div>

          {/* URL */}
          <div style={{
            fontSize: 22, color: "rgba(255,255,255,0.4)",
            marginTop: 12, letterSpacing: "2px",
          }}>
            cargoplus.site
          </div>
        </div>

        {/* Gold bottom accent line */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: 4, background: "linear-gradient(90deg, #D4AF37, #f0d060, #D4AF37)",
          display: "flex",
        }} />
      </div>
    ),
    { ...size }
  );
}
