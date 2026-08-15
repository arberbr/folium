/**
 * arXiv titles and abstracts are raw LaTeX fragments: roughly 10% of titles and
 * 60% of abstracts contain `$...$` math, and the feed leaves the markup intact.
 *
 * Two consumers need two different things:
 *   - `toPlainText` for places that cannot hold markup (document <title>,
 *     aria-label, tooltips, AI prompts).
 *   - `splitMath` for display, where math segments get handed to KaTeX.
 */

const BACKSLASH = "\\";

/** Commands with a faithful single-character Unicode equivalent. */
const SYMBOLS: Record<string, string> = {
  // relations
  geq: "≥",
  ge: "≥",
  leq: "≤",
  le: "≤",
  neq: "≠",
  ne: "≠",
  approx: "≈",
  simeq: "≃",
  cong: "≅",
  equiv: "≡",
  propto: "∝",
  sim: "∼",
  ll: "≪",
  gg: "≫",
  lesssim: "≲",
  gtrsim: "≳",
  subset: "⊂",
  supset: "⊃",
  subseteq: "⊆",
  supseteq: "⊇",
  in: "∈",
  notin: "∉",
  // operators
  times: "×",
  cdot: "·",
  div: "÷",
  pm: "±",
  mp: "∓",
  ast: "∗",
  star: "⋆",
  circ: "∘",
  bullet: "•",
  oplus: "⊕",
  otimes: "⊗",
  cup: "∪",
  cap: "∩",
  // arrows
  to: "→",
  rightarrow: "→",
  leftarrow: "←",
  Rightarrow: "⇒",
  Leftarrow: "⇐",
  leftrightarrow: "↔",
  Leftrightarrow: "⇔",
  mapsto: "↦",
  // misc
  infty: "∞",
  partial: "∂",
  nabla: "∇",
  forall: "∀",
  exists: "∃",
  sum: "∑",
  prod: "∏",
  int: "∫",
  sqrt: "√",
  angle: "∠",
  perp: "⊥",
  parallel: "∥",
  degree: "°",
  prime: "′",
  odot: "⊙",
  ldots: "…",
  dots: "…",
  cdots: "⋯",
  quad: " ",
  qquad: " ",
  langle: "⟨",
  rangle: "⟩",
  ell: "ℓ",
  hbar: "ℏ",
  Re: "ℜ",
  Im: "ℑ",
  // greek lower
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  varepsilon: "ε",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  vartheta: "ϑ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  pi: "π",
  rho: "ρ",
  varrho: "ϱ",
  sigma: "σ",
  varsigma: "ς",
  tau: "τ",
  upsilon: "υ",
  phi: "φ",
  varphi: "φ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  // greek upper
  Gamma: "Γ",
  Delta: "Δ",
  Theta: "Θ",
  Lambda: "Λ",
  Xi: "Ξ",
  Pi: "Π",
  Sigma: "Σ",
  Upsilon: "Υ",
  Phi: "Φ",
  Psi: "Ψ",
  Omega: "Ω",
};

/** Commands that are pure formatting — unwrap the argument, drop the command. */
const UNWRAP = [
  "text",
  "textrm",
  "textbf",
  "textit",
  "texttt",
  "textsf",
  "textsc",
  "emph",
  "mathrm",
  "mathbf",
  "mathit",
  "mathsf",
  "mathtt",
  "mathbb",
  "mathcal",
  "mathfrak",
  "mathscr",
  "boldsymbol",
  "bm",
  "operatorname",
  "rm",
  "bf",
  "it",
  "left",
  "right",
  "displaystyle",
  "scriptstyle",
  "mbox",
  "hbox",
];

const SUPERSCRIPTS: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "(": "⁽",
  ")": "⁾",
  n: "ⁿ",
  i: "ⁱ",
};

const SUBSCRIPTS: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "+": "₊",
  "-": "₋",
  "(": "₍",
  ")": "₎",
};

/**
 * Escaped literals (`\$`, `\%`, `\_`, …) are parked on control characters while
 * the syntax passes run, so the brace and dollar strippers cannot eat them.
 */
const ESCAPES: Array<[string, string]> = ["$", "&", "%", "#", "_", "{", "}"].map(
  (literal, index) => [literal, String.fromCharCode(1 + index)],
);

function toScript(body: string, table: Record<string, string>) {
  const chars = [...body];
  if (chars.length && chars.every((c) => c in table)) {
    return chars.map((c) => table[c]).join("");
  }
  return null;
}

/**
 * Flatten a LaTeX fragment to readable plain text. Lossy by design: this feeds
 * contexts where markup is impossible, so an approximate `10⁻³` beats `10^{-3}`.
 */
export function toPlainText(input: string, options: { collapse?: boolean } = {}): string {
  const { collapse = true } = options;
  if (!input) return "";
  let out = input;

  // Escaped literals first, so later passes don't mistake them for syntax.
  for (const [literal, token] of ESCAPES) {
    out = out.split(BACKSLASH + literal).join(token);
  }

  // Spacing commands, then the \[ \] and \( \) math delimiters.
  out = out
    .replace(/\\[,;:!>]/g, " ")
    .replace(/\\\\/g, " ")
    .replace(/~/g, " ");
  out = out.replace(/\\[[\]()]/g, " ");

  // Unwrap formatting commands, innermost first.
  const unwrapRe = new RegExp(`\\\\(?:${UNWRAP.join("|")})\\s*\\{([^{}]*)\\}`, "g");
  for (let i = 0; i < 6; i += 1) {
    const next = out.replace(unwrapRe, "$1");
    if (next === out) break;
    out = next;
  }
  // Bare switches with no argument: {\rm eff}, \left(, \displaystyle
  out = out.replace(new RegExp(`\\\\(?:${UNWRAP.join("|")})(?![a-zA-Z])`, "g"), "");

  // \frac{a}{b} -> (a/b)
  for (let i = 0; i < 4; i += 1) {
    const next = out.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "($1/$2)");
    if (next === out) break;
    out = next;
  }

  // Symbol commands; anything unrecognised is dropped.
  out = out.replace(/\\([a-zA-Z]+)/g, (_match, name: string) => SYMBOLS[name] ?? "");

  // Super/subscripts, braced then bare.
  // Unwrapping `{\rm eff}` can leave a leading space inside the braces, so trim
  // the body before deciding whether it maps to Unicode.
  out = out.replace(/\^\{([^{}]*)\}/g, (_m, body: string) => {
    const inner = body.trim();
    return toScript(inner, SUPERSCRIPTS) ?? `^${inner}`;
  });
  out = out.replace(/_\{([^{}]*)\}/g, (_m, body: string) => {
    const inner = body.trim();
    return toScript(inner, SUBSCRIPTS) ?? `_${inner}`;
  });
  out = out.replace(/\^(\w)/g, (_m, ch: string) => SUPERSCRIPTS[ch] ?? `^${ch}`);
  out = out.replace(/_(\w)/g, (_m, ch: string) => SUBSCRIPTS[ch] ?? `_${ch}`);

  // Delimiters and leftover grouping braces.
  out = out.replace(/\$+/g, "").replace(/[{}]/g, "");

  // Restore escaped literals.
  for (const [literal, token] of ESCAPES) {
    out = out.split(token).join(literal);
  }

  // Text runs between math segments must keep their edge spaces, or
  // "Lyman-$\alpha$ forest" loses the gap before "forest".
  return collapse ? out.replace(/\s+/g, " ").trim() : out;
}

export type MathSegment =
  | { type: "text"; value: string }
  | { type: "math"; value: string; display: boolean };

/**
 * Split a fragment into text and `$...$` / `$$...$$` math runs. An unmatched
 * delimiter is treated as a literal dollar sign rather than swallowing the
 * remainder of the string — abstracts do occasionally quote prices.
 */
export function splitMath(input: string): MathSegment[] {
  const segments: MathSegment[] = [];
  let text = "";
  let i = 0;

  const flushText = () => {
    if (text) {
      segments.push({ type: "text", value: text });
      text = "";
    }
  };

  while (i < input.length) {
    const ch = input[i];

    // \[ ... \] and \( ... \) are the other delimiter pair arXiv abstracts use.
    if (ch === BACKSLASH && (input[i + 1] === "[" || input[i + 1] === "(")) {
      const display = input[i + 1] === "[";
      const close = BACKSLASH + (display ? "]" : ")");
      const start = i + 2;
      const end = input.indexOf(close, start);
      if (end !== -1) {
        const body = input.slice(start, end).trim();
        if (body) {
          flushText();
          segments.push({ type: "math", value: body, display });
        }
        i = end + 2;
        continue;
      }
    }

    // Keep escape pairs intact so `\$` never opens a math run.
    if (ch === BACKSLASH && i + 1 < input.length) {
      text += input[i] + input[i + 1];
      i += 2;
      continue;
    }

    if (ch === "$") {
      const display = input[i + 1] === "$";
      const delim = display ? "$$" : "$";
      const start = i + delim.length;
      let end = -1;

      for (let j = start; j < input.length; j += 1) {
        if (input[j] === BACKSLASH) {
          j += 1;
          continue;
        }
        if (input.startsWith(delim, j)) {
          end = j;
          break;
        }
      }

      if (end === -1) {
        text += ch;
        i += 1;
        continue;
      }

      const body = input.slice(start, end).trim();
      if (body) {
        flushText();
        segments.push({ type: "math", value: body, display });
      }
      i = end + delim.length;
      continue;
    }

    text += ch;
    i += 1;
  }

  flushText();
  return segments;
}

/** True when a fragment has anything worth running through the renderer. */
export function hasLatex(input: string): boolean {
  return input.includes("$") || input.includes(BACKSLASH);
}
