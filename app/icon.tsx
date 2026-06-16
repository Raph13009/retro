import { ImageResponse } from "next/og";

// Generated favicon — crisp branded monogram instead of a downscaled 1.6MB logo.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1828",
          color: "#8FE7E1",
          fontSize: "44px",
          fontWeight: 800,
          borderRadius: "14px",
          fontFamily: "sans-serif"
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}
