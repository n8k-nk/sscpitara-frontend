import Markdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

// Question text is Markdown + LaTeX ($inline$, $$ display $$ on own lines) + GFM tables.
// Raw HTML is never rendered. Images render only from our own uploaded media (the API resolves img:<name>).
const remark = [remarkMath, remarkGfm];
const rehype = [[rehypeKatex, { strict: false, throwOnError: false }]];

const isLocalImage = (src) => typeof src === "string" && src.startsWith("/media/");
const isMockImage = (src) => typeof src === "string" && /^\/api\/study\/attempts\/\d+\/\d+\/assets\/\d+\/$/.test(src);
const img = ({ src, alt }) => (isMockImage(src) || isLocalImage(src))
  ? <img className="diagram" src={src} alt={alt ?? ""} loading="lazy" />
  : null;

export default function Rich({ children, inline = false, interactive = true, images = true }) {
  if (!children) return null;
  const components = {
    img: !images ? () => null : interactive ? img : ({ src, alt }) => isLocalImage(src) || isMockImage(src)
      ? <img className="diagram" src={src} alt={alt ?? ""} /> : null,
    ...(!interactive && { a: ({ children }) => <>{children}</> }),
    ...(inline && { p: ({ children }) => <>{children}</> }),
  };
  return <Markdown remarkPlugins={remark} rehypePlugins={rehype} components={components}>{children}</Markdown>;
}
