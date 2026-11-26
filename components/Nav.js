"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function NavLink({ href, children, match, ...rest }) {
  const path = usePathname();
  const current = match ? match.some((m) => path.startsWith(m)) : path === href;
  const link = useRef(null);
  // On narrow screens the nav scrolls sideways; centre the current item without moving the page.
  useEffect(() => {
    const el = link.current, nav = el?.closest("nav");
    if (!current || !nav || nav.scrollWidth <= nav.clientWidth) return;
    const a = el.getBoundingClientRect(), b = nav.getBoundingClientRect();
    nav.scrollLeft += a.left - b.left - (b.width - a.width) / 2;
  }, [current, path]);
  return <Link ref={link} href={href} aria-current={current ? "page" : undefined} {...rest}>{children}</Link>;
}
