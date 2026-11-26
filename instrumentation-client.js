// Next.js #99032: React's development profiler can emit negative end times
// when a Server Component redirects, errors, or is aborted.
if (process.env.NODE_ENV === "development") {
  const measure = performance.measure;

  performance.measure = function (name, options, endMark) {
    if (typeof name === "string" && name.startsWith("\u200b")
      && options?.detail?.devtools?.trackGroup === "Server Components ⚛"
      && typeof options.end === "number"
      && options.end < 0) {
      return;
    }

    return measure.call(this, name, options, endMark);
  };
}
