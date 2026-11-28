/** Record a conversion in Google Analytics. Does nothing when analytics is off or blocked. */
export const track = (name, params) => window.gtag?.("event", name, params);
