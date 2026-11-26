import Link from "next/link";
import { informationMetadata } from "../../../lib/information-pages";

export const metadata = informationMetadata("/contact/");

export default function Contact() {
  const email = process.env.PUBLIC_SUPPORT_EMAIL?.trim();

  return <>
    <h1>Contact SSC Pitara</h1>
    {email && <p>Email us at <a href={`mailto:${email}`}>{email}</a>.</p>}
    <p>Use the <Link href="/support/">support form</Link> after signing in to report a problem or request help. If you cannot sign in and have a verified recovery email, use <Link href="/account/reset/">password reset</Link>.</p>
    <h2>What to include</h2>
    <ul>
      <li><strong>Question or lesson errors.</strong> Include the page link, question number and the correction you suggest.</li>
      <li><strong>Payment issues.</strong> Include the Razorpay order or payment reference and payment date. Keep card numbers, UPI PINs, passwords and one-time codes private.</li>
      <li><strong>Privacy or rights requests.</strong> Describe the request and include the relevant account name or page link. For a content rights claim, identify the work and your relationship to it.</li>
    </ul>
  </>;
}
