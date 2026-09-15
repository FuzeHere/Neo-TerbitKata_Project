import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "@/lib/sanitize";

describe("Security - sanitizeHtml (XSS Prevention)", () => {
  it("should strip script tags and their content", () => {
    const dirty = '<p>Normal text</p><script>alert("XSS")</script>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("<script>");
    expect(clean).not.toContain('alert("XSS")');
    expect(clean).toContain("<p>Normal text</p>");
  });

  it("should remove inline event handlers (onerror, onload, onclick)", () => {
    const dirty = '<img src="valid.jpg" onerror="alert(1)" onload="evil()" />' +
                  '<a href="#" onclick="steal()">Click me</a>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("onerror");
    expect(clean).not.toContain("onload");
    expect(clean).not.toContain("onclick");
    expect(clean).toContain('src="valid.jpg"');
    expect(clean).toContain("Click me");
  });

  it("should neutralize javascript: pseudoprotocol in href and src", () => {
    const dirty = '<a href="javascript:alert(\'hack\')">Link</a>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("javascript:");
    expect(clean).toContain('href="#"');
  });

  it("should strip iframe, embed, object, and form elements", () => {
    const dirty = '<iframe src="https://evil.com"></iframe><form action="/steal"><input /></form>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("<iframe");
    expect(clean).not.toContain("<form");
    expect(clean).not.toContain("<input");
  });

  it("should preserve safe blog HTML formatting", () => {
    const safe = '<h1>Judul</h1><p>Paragraf <strong>tebal</strong> dan <em>miring</em></p>' +
                 '<blockquote>Kutipan</blockquote><a href="https://example.com">Tautan</a>';
    const clean = sanitizeHtml(safe);
    expect(clean).toContain("<h1>Judul</h1>");
    expect(clean).toContain("<strong>tebal</strong>");
    expect(clean).toContain("<em>miring</em>");
    expect(clean).toContain("<blockquote>Kutipan</blockquote>");
    expect(clean).toContain('href="https://example.com"');
  });
});
