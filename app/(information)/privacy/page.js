import Link from "next/link";
import { informationMetadata } from "../../../lib/information-pages";

export const metadata = informationMetadata("/privacy/");

export default function Privacy() {
  return <>
    <h1>Privacy Policy</h1>
    <p>This policy explains how SSC Pitara handles information when you browse, create an account, study or buy Premium access.</p>
    <h2>Information we use</h2>
    <ul>
      <li>Account information includes your username, a password hash and a recovery email if you supply one.</li>
      <li>Profile information you provide may include your display name, age or date of birth, education, exam preferences and category or age-relaxation information. We use it to suggest exams, plan study and provide relevant score references.</li>
      <li>Study activity includes practice answers, test results, progress and time spent on questions where recorded. We use it for scoring, review and study recommendations.</li>
      <li>We use support messages to investigate requests. When you purchase Premium, Razorpay processes checkout and SSC Pitara records order references, amounts and statuses to manage access and resolve payment issues.</li>
    </ul>
    <h2>AI study features</h2>
    <p>When you use an AI study feature, SSC Pitara may send your message and relevant lesson, question or study context to our AI service provider to generate a response. Tutor conversations may be saved in your account. If you choose to share a conversation, anyone with the share link can open it while sharing is enabled.</p>
    <h2>Cookies and browser storage</h2>
    <p>We use cookies to keep you signed in, protect requests and remember choices such as your theme and selected exam. Browser storage can remember current-affairs reading progress and the referral source for a sign-up. You can clear or block storage in your browser, which may sign you out or reset your preferences.</p>
    <h2>Analytics</h2>
    <p>SSC Pitara may use Google Analytics and Microsoft Clarity to understand how the site is found and used. They may use cookies and collect pages visited, the referring site, device and browser details, approximate location, clicks and scrolling. Clarity can replay a visit; for signed-in visitors the page text is masked. See the <a href="https://policies.google.com/privacy">Google Privacy Policy</a> and the <a href="https://privacy.microsoft.com/privacystatement">Microsoft Privacy Statement</a>. You can block these cookies in your browser.</p>
    <h2>Google advertising</h2>
    <p>If Google AdSense is enabled, Google and other advertising vendors may use cookies based on visits to SSC Pitara and other sites to serve ads. Google and its partners may use advertising cookies to personalize those ads. Ad vendors may also use web beacons, IP addresses or similar identifiers to serve and measure advertising.</p>
    <p>See <a href="https://policies.google.com/technologies/partner-sites">how Google uses data on partner sites</a>. You can turn off personalized Google ads in <a href="https://myadcenter.google.com/">My Ad Center</a> and manage participating third-party ad choices through <a href="https://optout.aboutads.info/">AdChoices</a>.</p>
    <h2>Your information and choices</h2>
    <p>Use your <Link href="/account/">account settings</Link> to review or update your profile. <Link href="/contact/">Contact SSC Pitara</Link> to request access, correction or deletion, or to ask how long specific records are kept. We may need to verify your identity before acting on a request and may retain records needed for payments, disputes or legal obligations.</p>
  </>;
}
