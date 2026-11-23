"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children, match, ...rest }) {
  const path = usePathname();
  const current = match ? match.some((m) => path.startsWith(m)) : path === href;
  return <Link href={href} aria-current={current ? "page" : undefined} {...rest}>{children}</Link>;
}
