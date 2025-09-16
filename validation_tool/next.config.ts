import type { NextConfig } from "next";

module.exports = {
    images: {
        domains: ['localhost'],
    }
}

const nextConfig: NextConfig = {
  /* config options here */
    typescript: {
        ignoreBuildErrors: true
    },
};

export default nextConfig;
