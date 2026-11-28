"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";

// These URLs carry secret tokens or are staff-only, so they are never sent to an analytics service.
const PRIVATE = /^\/(admin|account\/(reset|verify)|tutor\/share)(\/|$)/;

/** Google Analytics 4 and Microsoft Clarity. Each loads only when its ID is set. */
export default function Analytics({ ga, clarity }) {
  if (PRIVATE.test(usePathname())) return null;
  return <>
    {ga && <>
      <Script id="ga-init">{`window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',${JSON.stringify(ga)});`}</Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`} />
    </>}
    {clarity && <Script id="clarity-init">{`(function(c,a,i){c.clarity=c.clarity||function(){(c.clarity.q=c.clarity.q||[]).push(arguments)};var t=a.createElement('script');t.async=1;t.src='https://www.clarity.ms/tag/'+i;a.head.appendChild(t)})(window,document,${JSON.stringify(clarity)});`}</Script>}
  </>;
}
