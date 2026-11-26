const timezone = "Asia/Kolkata";
const number = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export function dateLabel(value, options = { day: "numeric", month: "short" }) {
  const iso = value.length === 10 ? `${value}T12:00:00+05:30` : value;
  return new Intl.DateTimeFormat("en-IN", { ...options, timeZone: timezone }).format(new Date(iso));
}

export const amount = (value) => number.format(value);
