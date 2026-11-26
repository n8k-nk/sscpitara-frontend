export const informationPages = [
  { path: "/about/", label: "About", title: "About SSC Pitara", description: "Learn how SSC Pitara helps candidates prepare for Staff Selection Commission exams." },
  { path: "/contact/", label: "Contact", title: "Contact SSC Pitara", description: "Get help with your account or payment, report a question error, or make a privacy or rights request." },
  { path: "/privacy/", label: "Privacy Policy", title: "Privacy Policy", description: "How SSC Pitara handles account, study and payment data, and how cookies and advertising may be used." },
  { path: "/terms/", label: "Terms of Use", title: "Terms of Use", description: "Terms for using SSC Pitara’s study material, account features and Premium access." },
  { path: "/refunds/", label: "Refund Policy", title: "Refund Policy", description: "Digital delivery, payment support and refund requests for SSC Pitara Premium." },
];

export function informationMetadata(path) {
  const { title, description } = informationPages.find((page) => page.path === path);
  return { title, description, alternates: { canonical: path } };
}
