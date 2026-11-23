import { fileURLToPath } from "node:url";

const backend = process.env.DJANGO_ORIGIN ?? "http://127.0.0.1:8024";

// Django serves only JSON (/api), the editorial admin and uploaded files. Every page is rendered here.
export default {
  trailingSlash: true,
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
  async rewrites() {
    return [
      { source: "/api/:rest*", destination: `${backend}/api/:rest*/` },
      { source: "/admin/:rest*", destination: `${backend}/admin/:rest*/` },
      ...["static", "media"].map((path) => ({
        source: `/${path}/:file*`,
        destination: `${backend}/${path}/:file*`,
      })),
    ];
  },
};
