import Link from "next/link";
import { informationPages } from "../lib/information-pages";

export default function InformationLinks() {
  return informationPages.map(({ path, label }) => <Link key={path} href={path}>{label}</Link>);
}
