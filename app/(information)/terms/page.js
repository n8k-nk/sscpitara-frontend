import Link from "next/link";
import { informationMetadata } from "../../../lib/information-pages";

export const metadata = informationMetadata("/terms/");

export default function Terms() {
  return <>
    <h1>Terms of Use</h1>
    <p>These terms apply when you use SSC Pitara’s website, study tools or account features.</p>
    <h2>Accounts and acceptable use</h2>
    <p>Keep your credentials private and provide accurate information when you use account features. Use the site for lawful study and preparation. Do not try to access another learner’s account, bypass access controls or interfere with the service.</p>
    <h2>Study material and exam information</h2>
    <p>SSC Pitara is an independent study platform. Practice scores are for preparation, and AI responses can contain errors. Check official exam requirements, dates and results at <a href="https://ssc.gov.in/">ssc.gov.in</a>. Third-party material remains subject to the rights of its owners. You may use SSC Pitara’s own study content for personal preparation. Ask before republishing it.</p>
    <h2>Premium access</h2>
    <p>When checkout is available, review the price, access period and included features on the <Link href="/plans/">plans page</Link> and at checkout. Premium gives digital access to the purchasing account. See the <Link href="/refunds/">Refund Policy</Link> for payment and access issues.</p>
    <h2>Questions</h2>
    <p><Link href="/contact/">Contact SSC Pitara</Link> for account, content or payment questions. The <Link href="/privacy/">Privacy Policy</Link> describes how we handle your information.</p>
  </>;
}
