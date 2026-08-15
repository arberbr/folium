import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@libsql/client"],
  outputFileTracingIncludes: {
    "*": ["./drizzle/**/*"],
  },
};

export default nextConfig;
