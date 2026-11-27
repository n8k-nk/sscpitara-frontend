"use client";

import Link from "./NavigationLink";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CREDITS_EVENT } from "../lib/client";
import SignOut from "./SignOut";

const SECTIONS = [
  { label: "Study", items: [
    { href: "/learn/", label: "Learn", match: ["/learn", "/study/learn"], icon: "learn" },
    { href: "/study/practice/", label: "Practice", match: ["/study/practice", "/study/attempt"], icon: "practice" },
    { href: "/pyq/", label: "PYQs", match: ["/pyq"], icon: "pyq" },
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

const primaryIcons = ["learn", "practice", "pyq", "tutor", "games", "analytics"];
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
    {name === "tutor" && <g {...common}>
      <path d="M12 3l1.9 4.8L18.7 9.7l-4.8 1.9L12 16.4l-1.9-4.8-4.8-1.9 4.8-1.9L12 3Z" />
      <path d="M19 16l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
    </g>}
    {name === "account" && <g {...common}><circle cx="12" cy="8" r="3.2" /><path d="M5 20v-1a7 7 0 0 1 14 0v1" /></g>}
    {name === "billing" && <g {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></g>}
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

function Brand({ className, premium = false }) {
  return <Link className={`brand ${className}`} href="/" aria-label={premium ? "SSC Pitara Premium home" : "SSC Pitara home"}>
    <span className="brand-mark">
      {premium && (
        <svg className="brand-crown" viewBox="0 0 24 18" width="18" height="14" aria-hidden="true">
          <path d="M2.5 14.5 1 5.5l5.5 4L12 2.5l5.5 7L23 5.5l-1.5 9H2.5Z" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="12" cy="2.5" r="1.4" fill="#FDE68A" />
          <circle cx="1.5" cy="5.5" r="1.2" fill="#FDE68A" />
          <circle cx="22.5" cy="5.5" r="1.2" fill="#FDE68A" />
        </svg>
      )}
      <img src="/icon.svg" width="38" height="32" alt="" />
    </span>
    <span className="brand-name">SSC Pitara</span>
  </Link>;
}

function rememberSidebar(collapsed) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `sidebar=${collapsed ? "collapsed" : "expanded"}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

function Destination({ item, path, onClick }) {
  return <Link href={item.href} prefetch={item.prefetch ?? false} title={item.label}
    className={item.icon === "tutor" ? "nav-tutor" : undefined}
    aria-current={isCurrent(item, path) ? "page" : undefined} onClick={onClick}>
    <span className="nav-mark"><Mark name={item.icon} /></span>
    <span className="nav-label">{item.label}</span>
  </Link>;
}

function AccountNavigation({ user, path, onClick }) {
  const { authenticated } = user;
  const billing = !authenticated ? null
    : user.premium
      ? { href: "/billing/", label: "Billing", match: ["/billing"], icon: "billing" }
      : { href: "/plans/", label: "Plan", match: ["/plans"], icon: "billing" };
  const account = authenticated
    ? { href: "/account/", label: "Account", match: ["/account", "/onboarding"], icon: "account" }
    : { href: "/signin/", label: "Sign in", match: ["/signin"], icon: "signin" };
  return <nav className="side-nav side-account" aria-label="Account">
    {authenticated && !user.premium && <div className="premium-nudge">
      <p><strong>Winter offer</strong> Premium worth <del>₹199</del> is free for one year.</p>
      <Link className="button block" href="/plans/" onClick={onClick}>Get Premium free</Link>
    </div>}
    {billing && <Destination item={billing} path={path} onClick={onClick} />}
    <Destination item={account} path={path} onClick={onClick} />
    {authenticated && <SignOut title="Sign out">
      <span className="nav-mark"><Mark name="signout" /></span><span className="nav-label">Sign out</span>
    </SignOut>}
  </nav>;
}

function WinterOffer() {
  return <div className="offer-strip" role="region" aria-label="Winter offer">
    <p>Winter offer: <del>₹199</del> Premium, free.</p>
    <Link className="button" href="/plans/">Get Premium free</Link>
  </div>;
}

function Credits({ user, path }) {
  const { authenticated, credits, premium } = user;
  const creditsDialog = useRef(null);
  useEffect(() => { creditsDialog.current?.close(); }, [path]);
  if (!authenticated) return null;

  return <>
    <button
      type="button"
      className={`credits-pill${credits === 0 ? " empty" : ""}`}
      aria-haspopup="dialog"
      aria-controls="credits-info-dialog"
      aria-label={`${credits} AI credits remaining. Tap to see what AI credits are for.`}
      onClick={() => creditsDialog.current?.showModal()}
    >
      <span aria-hidden="true">✦</span>
      <span>{credits}</span>
      <span className="credits-label">AI credit{credits === 1 ? "" : "s"}</span>
    </button>
    <dialog
      id="credits-info-dialog"
      ref={creditsDialog}
      className="credits-dialog"
      aria-labelledby="credits-dialog-title"
      onClick={(event) => { if (event.target === creditsDialog.current) creditsDialog.current?.close(); }}
    >
      <div className="credits-dialog-body">
        <div className="credits-dialog-head">
          <div>
            <span className="eyebrow">{premium ? "Premium" : "Free plan"}</span>
            <h2 id="credits-dialog-title">AI Credits: {credits} remaining</h2>
          </div>
          <button type="button" className="sheet-close" aria-label="Close" onClick={() => creditsDialog.current?.close()}>
            <MenuIcon kind="close" />
          </button>
        </div>
        <p className="muted">
          AI credits power all AI features on SSC Pitara. Each request uses <strong>1 credit</strong>:
        </p>
        <ul className="credits-dialog-list">
          <li><span>AI Tutor chat</span><strong>1 credit / message</strong></li>
          <li><span>PYQ Ask AI &amp; mistake feedback</span><strong>1 credit / request</strong></li>
          <li><span>Analytics AI review</span><strong>1 credit / review</strong></li>
          <li><span>Lesson Ask AI</span><strong>1 credit / question</strong></li>
        </ul>
        {!premium && (
          <p className="credits-dialog-upsell">
            Free accounts start with <strong>5 credits</strong>. Claim Winter Offer Premium (<strong>₹0 / 1 year</strong>) for <strong>+2,000 AI credits</strong>, or top up <strong>+150 AI credits for ₹100</strong> anytime.
          </p>
        )}
        <div className="credits-dialog-actions">
          {!premium && (
            <Link className="button" href="/plans/" onClick={() => creditsDialog.current?.close()}>
              Get 2,000 AI Credits · ₹0
            </Link>
          )}
          {premium && <Link className="button secondary" href="/billing/" onClick={() => creditsDialog.current?.close()}>
            View billing
          </Link>}
        </div>
      </div>
    </dialog>
  </>;
}

export default function AppShell({ children, user, ...props }) {
  const path = usePathname();
  const [liveUser, setLiveUser] = useState(user);
  const prevPathRef = useRef(path);

  useEffect(() => {
    setLiveUser(user);
  }, [user]);

  useEffect(() => {
    const onCredits = (e) => {
      const detail = e.detail || {};
      setLiveUser((prev) => ({
        ...prev,
        credits: typeof detail.credits === "number"
          ? Math.max(0, detail.credits)
          : Math.max(0, (prev.credits ?? 0) + (detail.delta ?? 0)),
      }));
    };
    window.addEventListener(CREDITS_EVENT, onCredits);
    return () => window.removeEventListener(CREDITS_EVENT, onCredits);
  }, []);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = path;
    const shouldRefresh =
      !liveUser.authenticated ||
      /^\/(signin|signup|billing|plans|tutor|account|study)(\/|$)/.test(prev) ||
      /^\/(billing|plans)(\/|$)/.test(path);
    if (!shouldRefresh || prev === path) return;
    let active = true;
    fetch("/api/session/", { credentials: "same-origin", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        setLiveUser({
          authenticated: Boolean(data.authenticated),
          credits: data.credits ?? 0,
          premium: Boolean(data.premium),
        });
      })
      .catch(() => {});
    return () => { active = false; };
  }, [path, liveUser.authenticated]);

  if (path === "/" || /^\/(signin|signup|about|contact|privacy|terms|refunds)\/?$/.test(path)) return children;
  if (/^\/plans\/?$/.test(path) && !liveUser.authenticated) return children;

  return <Shell path={path} user={liveUser} {...props}>{children}</Shell>;
}

function Shell({ path, exam, controls, user, footer, children, collapsed: collapsedAtStart = false }) {
  const [collapsed, setCollapsed] = useState(collapsedAtStart);
  const dialog = useRef(null);

  useEffect(() => { dialog.current?.close(); }, [path]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 900px)");
    const closeOnDesktop = () => { if (desktop.matches) dialog.current?.close(); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const moreCurrent = moreItems.some((item) => isCurrent(item, path)) || /^\/(account|onboarding|billing|plans|signin)(\/|$)/.test(path);
  const closeMore = () => dialog.current?.close();

  return <div className="app-shell" data-collapsed={collapsed ? "true" : undefined}>
    <header className="site-header"><div className="bar">
      <div className="shell-masthead">
        <button type="button" className="nav-toggle" aria-expanded={!collapsed} aria-controls="site-menu"
          onClick={() => { rememberSidebar(!collapsed); setCollapsed(!collapsed); }}>
          <MenuIcon kind="menu" /><span className="sr-only">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
        </button>
        <Brand className="header-brand" premium={user.premium} />
      </div>
      {exam}
      <div className="header-controls">
        <Credits user={user} path={path} />
        {controls}
      </div>
    </div></header>
    {user.authenticated && !user.premium && <WinterOffer />}
    <div className="shell-body">
      <aside id="site-menu" className="site-sidebar">
        <nav className="side-nav" aria-label="Main">
          {SECTIONS.map((section) => <ul key={section.label} aria-label={section.label}>
            {section.items.map((item) => <li key={item.href}><Destination item={item} path={path} /></li>)}
          </ul>)}
        </nav>
        <AccountNavigation user={user} path={path} />
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
        <AccountNavigation user={user} path={path} onClick={closeMore} />
      </div>
    </dialog>

  </div>;
}
