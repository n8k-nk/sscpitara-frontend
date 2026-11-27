import { cookies } from "next/headers";
import { site, indexable, SHARE_IMAGE } from "../lib/public";
import { session } from "../lib/server";
import ThemeToggle from "../components/ThemeToggle";
import Capture from "../components/Capture";
import AppShell from "../components/AppShell";
import SiteFooter from "../components/SiteFooter";
import ExamPicker from "../components/ExamPicker";
import { studyContext } from "../lib/study-scope";
import { Suspense } from "react";
import "katex/dist/katex.min.css";
import "./style.css";

export const metadata = {
  metadataBase: site,
  title: { default: "SSC Pitara", template: "%s | SSC Pitara" },
  openGraph: { siteName: "SSC Pitara", type: "website", images: [SHARE_IMAGE] },
  twitter: { card: "summary_large_image", images: [SHARE_IMAGE.url] },
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
};

const themeOf = async () => ((await cookies()).get("theme")?.value === "light" ? "light" : "dark");

export async function generateViewport() {
  // resizes-content: the on-screen keyboard shrinks the page instead of sliding over the chat composer.
  return { themeColor: (await themeOf()) === "light" ? "#ffffff" : "#0a0a0a", interactiveWidget: "resizes-content" };
}


async function HeaderExam() {
  const study = await studyContext();
  return study.selected ? <ExamPicker {...study} /> : null;
}

async function ShellFooter() {
  const user = await session();
  return <SiteFooter authenticated={user.authenticated} premium={Boolean(user.premium)} />;
}

export default async function Layout({ children }) {
  const [jar, rawUser] = await Promise.all([cookies(), session()]);
  const theme = jar.get("theme")?.value === "light" ? "light" : "dark";
  const user = {
    authenticated: Boolean(rawUser.authenticated),
    credits: rawUser.credits ?? 0,
    premium: Boolean(rawUser.premium),
  };
  return <html lang="en" data-theme={theme} suppressHydrationWarning><body>
    <Capture />
    <a className="skip" href="#main">Skip to content</a>
    <AppShell
      collapsed={jar.get("sidebar")?.value === "collapsed"}
      exam={<Suspense fallback={null}><HeaderExam /></Suspense>}
      controls={<ThemeToggle />}
      user={user}
      footer={<Suspense fallback={null}><ShellFooter /></Suspense>}
    >{children}</AppShell>
  </body></html>;
}
