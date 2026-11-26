"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SignOut from "./SignOut";

const SECTIONS = [
  { label: "Study", items: [
    { href: "/learn/", label: "Learn", match: ["/learn", "/study/learn"], icon: "learn" },
    { href: "/study/practice/", label: "Practice", match: ["/study/practice", "/study/attempt"], icon: "practice" },
    { href: "/pyq/", label: "PYQs", match: ["/pyq"], prefetch: false, icon: "pyq" },
    { href: "/games/", label: "Games", match: ["/games"], prefetch: false, icon: "games" },
    { href: "/tutor/", label: "AI Tutor", match: ["/tutor"], prefetch: false, icon: "tutor" },
  ] },
  { label: "Progress", items: [
    { href: "/analytics/", label: "Analytics", match: ["/analytics"], prefetch: false, icon: "analytics" },
  ] },
  { label: "Reading", items: [
    { href: "/current-affairs/", label: "Current Affairs", match: ["/current-affairs"], icon: "affairs" },
    { href: "/news/", label: "News", match: ["/news"], icon: "news" },
  ] },
];

const primaryIcons = ["learn", "practice", "pyq", "analytics"];
const destinations = SECTIONS.flatMap((section) => section.items);
const primaryItems = primaryIcons.map((icon) => destinations.find((item) => item.icon === icon));
const moreItems = destinations.filter((item) => !primaryIcons.includes(item.icon));

function isCurrent(item, path) {
  return item.match.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function Mark({ name }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" };
  return <svg viewBox="0 0 24 24" aria-hidden="true">
    {name === "more" && <g fill="currentColor">{[4, 12, 20].map((x) => <circle key={x} cx={x} cy="12" r="1.7" />)}</g>}
    {name === "learn" && <g {...common}><path d="M12 6c-2-2-5-2.5-9-2v14c4-.5 7 0 9 2 2-2 5-2.5 9-2V4c-4-.5-7 0-9 2Zm0 0v14" /></g>}
    {name === "practice" && <g {...common}><path d="m13 6 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0 0-3l-.5-.5a2.1 2.1 0 0 0-3 0L5 15.5 4 20Z" /></g>}
    {name === "games" && <g {...common}><path d="M8 7h8a4 4 0 0 1 3.9 3.2l1 5a2.5 2.5 0 0 1-4.2 2.3L14.5 15h-5l-2.2 2.5a2.5 2.5 0 0 1-4.2-2.3l1-5A4 4 0 0 1 8 7Z" /><path d="M7 11h4m-2-2v4m6-2h.01m2 2h.01" /></g>}
    {name === "affairs" && <g {...common}><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4m8-4v4M4 10h16m-8 3v5m-2.5-2.5h5" /></g>}
    {name === "news" && <g {...common}><path d="M18 7h3v11a2 2 0 0 1-2 2m-1-16H3v13a3 3 0 0 0 3 3h13a1 1 0 0 1-1-1V4ZM7 8h7m-7 8h7m-7-4h7" /></g>}
    {name === "pyq" && <g {...common}><path d="M7 3h8l4 4v14H7V3Zm8 0v4h4M4 6v12m6-6h6m-6 4h6" /></g>}
    {name === "analytics" && <g {...common}><path d="M4 4v16h16M8 15l4-5 3 2 5-6" /></g>}
    {name === "tutor" && <g {...common}><path d="M12 2a9 9 0 0 1 9 9c0 4-2.6 7.4-6.3 8.6L12 22l-2.7-2.4C5.6 18.4 3 15 3 11a9 9 0 0 1 9-9Z" /><path d="M9 10h6m-3-3v6" /></g>}
    {name === "account" && <g {...common}><circle cx="12" cy="8" r="3.2" /><path d="M5 20v-1a7 7 0 0 1 14 0v1" /></g>}
    {name === "signin" && <path {...common} d="M14 4h6v16h-6M3 12h12m-4-4 4 4-4 4" />}
    {name === "signout" && <g {...common}><path d="M12 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" /><path d="M9 12h12m-4-4 4 4-4 4" /></g>}
  </svg>;
}

function MenuIcon({ kind }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    {kind === "close" && <path {...common} d="M6 6l12 12M18 6 6 18" />}
    {kind === "menu" && <path {...common} d="M4 7h16M4 12h16M4 17h16" />}
  </svg>;
}

function Brand({ className }) {
  return <Link className={`brand ${className}`} href="/" aria-label="SSC Pitara home">
    <img src="/icon.svg" width="38" height="32" alt="" />
    <span className="brand-name">SSC Pitara</span>
  </Link>;
}

function rememberSidebar(collapsed) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `sidebar=${collapsed ? "collapsed" : "expanded"}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

function Destination({ item, path, onClick }) {
  return <Link href={item.href} prefetch={item.prefetch} title={item.label}
    aria-current={isCurrent(item, path) ? "page" : undefined} onClick={onClick}>
    <span className="nav-mark"><Mark name={item.icon} /></span>
    <span className="nav-label">{item.label}</span>
  </Link>;
}

export default function AppShell({ exam, controls, authenticated, footer, children, collapsed: collapsedAtStart = false }) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(collapsedAtStart);
  const dialog = useRef(null);

  useEffect(() => { dialog.current?.close(); }, [path]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 900px)");
    const closeOnDesktop = () => { if (desktop.matches) dialog.current?.close(); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const guestPlans = (path === "/plans" || path === "/plans/") && !authenticated;
  if (path === "/" || guestPlans) return children;

  const account = authenticated
    ? { href: "/account/", label: "Account", match: ["/account", "/onboarding"], icon: "account" }
    : { href: "/signin/", label: "Sign in", match: ["/signin"], icon: "signin" };
  const moreCurrent = [...moreItems, account].some((item) => isCurrent(item, path));
  const closeMore = () => dialog.current?.close();
  const signOut = authenticated && <SignOut title="Sign out">
    <span className="nav-mark"><Mark name="signout" /></span><span className="nav-label">Sign out</span>
  </SignOut>;

  return <div className="app-shell" data-collapsed={collapsed ? "true" : undefined}>
    <header className="site-header"><div className="bar">
      <div className="shell-masthead">
        <button type="button" className="nav-toggle" aria-expanded={!collapsed} aria-controls="site-menu"
          onClick={() => { rememberSidebar(!collapsed); setCollapsed(!collapsed); }}>
          <MenuIcon kind="menu" /><span className="sr-only">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
        </button>
        <Brand className="header-brand" />
      </div>
      {exam}
      <div className="header-controls">{controls}</div>
    </div></header>
    <div className="shell-body">
      <aside id="site-menu" className="site-sidebar">
        <nav className="side-nav" aria-label="Main">
          {SECTIONS.map((section) => <ul key={section.label} aria-label={section.label}>
            {section.items.map((item) => <li key={item.href}><Destination item={item} path={path} /></li>)}
          </ul>)}
        </nav>
        <nav className="side-nav side-account" aria-label="Account">
          <Destination item={account} path={path} />
          {signOut}
        </nav>
      </aside>
      <div className="app-column">
        <main id="main">{children}</main>
        {footer}
      </div>
    </div>
    <nav className="bottom-nav" aria-label="Main">
      {primaryItems.map((item) => <Destination key={item.href} item={item} path={path} />)}
      <button type="button" aria-haspopup="dialog" aria-controls="more-nav" data-current={moreCurrent || undefined}
        onClick={() => dialog.current?.showModal()}>
        <span className="nav-mark"><Mark name="more" /></span>More
      </button>
    </nav>
    <dialog className="more-sheet" id="more-nav" ref={dialog} aria-labelledby="more-heading"
      onClick={(event) => { if (event.target === dialog.current) closeMore(); }}>
      <div className="more-content">
        <div className="more-heading"><h2 id="more-heading">More</h2>
          <button type="button" className="sheet-close" aria-label="Close menu" onClick={closeMore}><MenuIcon kind="close" /></button>
        </div>
        <nav className="side-nav" aria-label="More destinations">
          {moreItems.map((item) => <Destination key={item.href} item={item} path={path} onClick={closeMore} />)}
        </nav>
        <nav className="side-nav side-account" aria-label="Account">
          <Destination item={account} path={path} onClick={closeMore} />
          {signOut}
        </nav>
      </div>
    </dialog>
  </div>;
}
