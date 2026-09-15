/**
 * Sanitizes an HTML string by removing dangerous elements, script tags, 
 * inline event handlers (onerror, onload, onclick, etc.), and malicious URI schemes (javascript:).
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") {
    return "";
  }

  let clean = dirtyHtml;

  // 1. Remove dangerous tags and their contents completely
  const dangerousTags = [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "applet",
    "base",
    "form",
    "input",
    "button",
    "link",
    "meta"
  ];

  for (const tag of dangerousTags) {
    const tagRegex = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");
    clean = clean.replace(tagRegex, "");
    
    // Also remove self-closing or unclosed variants
    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi");
    clean = clean.replace(selfClosingRegex, "");
  }

  // 2. Remove all inline event handlers (on* attributes like onload, onerror, onclick, etc.)
  clean = clean.replace(/\s+on[a-zA-Z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // 3. Neutralize javascript: and vbscript: URLs in href and src attributes
  clean = clean.replace(
    /\s+(href|src)\s*=\s*(["'])\s*(?:javascript|vbscript|data:(?!image\/)):[\s\S]*?\2/gi,
    ' $1="#"'
  );

  return clean;
}
