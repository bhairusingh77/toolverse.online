import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb', // Set to 10MB (adjust if needed)
        },
    },
};

export default nextConfig;
