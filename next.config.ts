import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BASEPATH: "/dashboard",
    PLUGINS_ENDPOINT: "https://raw.githubusercontent.com/MediahTM/Mediah-Plugins/refs/heads/main/plugins.json",
    LOGO: "https://avatars.githubusercontent.com/u/165603488?s=50&v=4"
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: ''
      }
    ]
  }
};

export default nextConfig;