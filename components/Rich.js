import Markdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

// Question text is Markdown + LaTeX ($inline$, $$ display $$ on own lines) + GFM tables.
// Raw HTML is never rendered. Images render only from our own uploaded media (the API resolves img:<name>).
const remark = [remarkMath, remarkGfm];
const rehype = [[rehypeKatex, { strict: false, throwOnError: false }]];

const img = ({ src, alt }) => typeof src === "string" && src.startsWith("/media/")
  ? <a href={src} target="_blank" rel="noopener"><img className="diagram" src={src} alt={alt ?? ""} loading="lazy" /></a>
  : null;

export default function Rich({ children, inline = false }) {
  if (!children) return null;
  const components = inline ? { img, p: ({ children }) => <>{children}</> } : { img };
  return <Markdown remarkPlugins={remark} rehypePlugins={rehype} components={components}>{children}</Markdown>;
}
