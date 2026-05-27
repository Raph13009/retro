import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/ongoing",
        destination: "/",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
