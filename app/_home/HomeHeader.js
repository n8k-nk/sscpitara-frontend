"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "../../components/ThemeToggle";
import css from "../home.module.css";

const NAV_LINKS = [
  { href: "#learn", label: "Learn" },
  { href: "#practice", label: "Practice" },
  { href: "#tutor", label: "AI Tutor" },
  { href: "#resources", label: "Resources" },
];

function MenuIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}

export default function HomeHeader({ authenticated }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const firstLink = drawerRef.current?.querySelector("a");
    firstLink?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 900) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const accountHref = authenticated ? "/account/" : "/signin/";
  const accountLabel = authenticated ? "My account" : "Sign in";

  return (
    <header className={css.headerWrap}>
      <div className={css.headerBar}>
        <Link href="/" className={css.brand}>
          <img src="/icon.svg" width="34" height="28" alt="" />
          <span>SSC Pitara</span>
        </Link>

        <nav className={css.desktopNav} aria-label="Main">
          {NAV_LINKS.map((item) => (
            <a key={item.href} href={path === "/" ? item.href : `/${item.href}`} className={css.navLink}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={css.headerActions}>
          <div className={css.themeSlot}>
            <ThemeToggle />
          </div>
          <Link href={accountHref} className={css.accountBtn}>
            {accountLabel}
          </Link>
          <Link href="/learn/" className={css.openBtn}>
            Open SSC Pitara
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className={css.menuToggle}
            aria-expanded={open}
            aria-controls="home-mobile-menu"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen((prev) => !prev)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      {open && (
        <div id="home-mobile-menu" ref={drawerRef} className={css.mobileDrawer} role="region" aria-label="Mobile navigation">
          <nav className={css.mobileNav} aria-label="Mobile sections">
            {NAV_LINKS.map((item) => (
              <a key={item.href} href={path === "/" ? item.href : `/${item.href}`} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className={css.mobileActions}>
            <Link href={accountHref} className={css.mobileAccountBtn} onClick={() => setOpen(false)}>
              {accountLabel}
            </Link>
            <Link href="/learn/" className={css.mobileOpenBtn} onClick={() => setOpen(false)}>
              Open SSC Pitara
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
