import { ImageResponse } from "next/og";
import { PRODUCT_NAME } from "@/lib/brand";

export const runtime = "edge";

// Dynamic 1200x630 social share image (Open Graph + Twitter).
// Replaces the old logo-as-OG which had wrong dimensions and a 1.6MB weight.
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #8FE7E1 0%, #B7F0D1 50%, #FFD9C7 100%)",
          fontFamily: "sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: "34px",
            fontWeight: 700,
            color: "#1a1828"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#1a1828",
              color: "#8FE7E1",
              fontSize: "40px",
              fontWeight: 800
            }}
          >
            P
          </div>
          {PRODUCT_NAME}
        </div>
        <div
          style={{
            marginTop: "40px",
            fontSize: "76px",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#1a1828",
            maxWidth: "900px"
          }}
        >
          Free Sprint Retrospective Tool
        </div>
        <div
          style={{
            marginTop: "28px",
            fontSize: "36px",
            fontWeight: 500,
            color: "#2f3c34"
          }}
        >
          Realtime board · voting · action items · no signup
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
