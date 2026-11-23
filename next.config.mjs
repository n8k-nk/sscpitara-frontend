import { fileURLToPath } from "node:url";

const backend = process.env.DJANGO_ORIGIN ?? "http://127.0.0.1:8024";
const djangoPaths = ["signin", "signup", "signout", "onboarding", "account",
  "support", "study", "billing", "admin"];

export default {
  trailingSlash: true,
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
  async rewrites() {
    return [
      ...djangoPaths.map((path) => ({
        source: `/${path}/:rest*`,
        destination: `${backend}/${path}/:rest*/`,
      })),
      ...["static", "media"].map((path) => ({
        source: `/${path}/:file*`,
        destination: `${backend}/${path}/:file*`,
      })),
    ];
  },
};
