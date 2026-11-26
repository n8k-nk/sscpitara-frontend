import Link from "next/link";
import { informationMetadata } from "../../../lib/information-pages";

export const metadata = informationMetadata("/refunds/");

export default function Refunds() {
  return <>
    <h1>Refund Policy</h1>
    <h2>Digital delivery</h2>
    <p>SSC Pitara Premium is delivered digitally. Access is added to the account used for purchase after payment is verified. See <Link href="/plans/">plans and checkout</Link> for the current price, access period and purchase-specific refund terms.</p>
    <h2>Report a payment or access problem</h2>
    <p>If you were charged twice, paid but cannot access Premium, or want to request a refund, <Link href="/contact/">contact support</Link>. Include the Razorpay order or payment reference, the payment date and a short description. Support can check the payment status and review the request under the terms shown for the purchase and applicable consumer rights.</p>
  </>;
}
