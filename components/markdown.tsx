"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders model output as markdown, styled to the same vocabulary the rest of arXivDesk
 * uses — primary-tinted rules on list items, uppercase tracked section labels, Fraunces
 * for anything display-sized. Raw HTML in the source is ignored rather than rendered,
 * which is react-markdown's default and the reason no sanitizer is wired up here.
 */
const components: Components = {
  p: ({ children }) => <p className="leading-relaxed">{children}</p>,

  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,

  // The rule sits on direct children of <ul> rather than on <li> itself: react-markdown
  // stopped passing an `ordered` flag to list items in v9, so the parent is the only
  // place that still knows which kind of list this is.
  // The bullet styling mirrors BriefingList in paper-briefing.tsx, so a chat answer and
  // a briefing read as the same document.
  ul: ({ children }) => (
    <ul className="space-y-1.5 [&>li]:border-l-2 [&>li]:border-primary/50 [&>li]:pl-3">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1.5 pl-5 marker:text-primary">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,

  h1: ({ children }) => <h3 className="font-heading text-lg leading-snug">{children}</h3>,
  h2: ({ children }) => <h4 className="font-heading text-base leading-snug">{children}</h4>,
  h3: ({ children }) => (
    <h5 className="text-xs tracking-[0.2em] text-primary uppercase">{children}</h5>
  ),
  h4: ({ children }) => (
    <h6 className="text-xs tracking-[0.2em] text-primary uppercase">{children}</h6>
  ),

  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-primary underline underline-offset-4"
    >
      {children}
    </a>
  ),

  code: ({ children, className }) =>
    // react-markdown only sets a language-* class on fenced blocks, so its absence
    // means this is an inline span and should not get block padding.
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
    ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-lg border border-border/80 bg-secondary/50 p-3 font-mono text-xs leading-relaxed">
      {children}
    </pre>
  ),

  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-border pl-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-border/70" />,

  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border px-2 py-1.5 font-medium">{children}</th>
  ),
  td: ({ children }) => <td className="border-b border-border/50 px-2 py-1.5">{children}</td>,
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-3">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
