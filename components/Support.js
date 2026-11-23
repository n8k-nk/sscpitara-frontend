"use client";
import { useState } from "react";
import AuthShell from "./AuthShell";
import Done from "./Done";
import SimpleForm from "./SimpleForm";

export default function Support() {
  const [reference, setReference] = useState("");
  if (reference) return <Done title="Support request received" detail={`Reference ${reference}.`} />;
  return <AuthShell title="Contact support" sub="Tell us what went wrong and include the page or question if you can.">
    <SimpleForm endpoint="support" action="Send request" done={(data) => setReference(data.reference)}
      fields={[{ name: "message", label: "Message", type: "textarea", required: true, maxLength: 2500 }]} />
  </AuthShell>;
}
