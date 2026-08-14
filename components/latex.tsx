import katex from "katex";
import { hasLatex, splitMath, toPlainText } from "@/lib/arxiv/latex";

/**
 * Renders an arXiv title or abstract, typesetting `$...$` runs with KaTeX.
 *
 * This is a server component: KaTeX runs at render time and ships plain HTML,
 * so none of the library reaches the client bundle. Anything KaTeX cannot parse
 * falls back to the Unicode approximation rather than KaTeX's red error text.
 */
export function Latex({ children }: { children: string }) {
  if (!children) return null;
  if (!hasLatex(children)) return <>{children}</>;

  return (
    <>
      {splitMath(children).map((segment, index) => {
        if (segment.type === "text") {
          return <span key={index}>{toPlainText(segment.value, { collapse: false })}</span>;
        }

        try {
          const html = katex.renderToString(segment.value, {
            displayMode: segment.display,
            throwOnError: true,
            strict: false,
            // trust:false keeps \href and raw-HTML commands disabled, so the
            // markup below is KaTeX's own escaped output and nothing else.
            trust: false,
            // Must stay htmlAndMathml: KaTeX marks the visual span
            // aria-hidden, so output:"html" would leave screen readers with
            // nothing at all where an equation should be.
            output: "htmlAndMathml",
          });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch {
          return <span key={index}>{toPlainText(segment.value)}</span>;
        }
      })}
    </>
  );
}
