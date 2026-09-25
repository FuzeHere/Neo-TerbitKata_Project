"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  Newspaper,
  Code,
  Eye,
  Undo,
  Redo,
  Search,
  X,
  Loader2,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string | null;
  categories?: { id: string; name: string; slug: string }[];
  publishedAt?: string | null;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis isi berita Anda di sini..."
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value || "");

  // Store selection range so modals don't lose the user's cursor/highlight position
  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null);

  // Floating Selection (Bubble Menu) State
  const [bubbleMenuPos, setBubbleMenuPos] = useState<{ top: number; left: number } | null>(null);

  // Link Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  // Internal Article Picker Modal State
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [insertFormat, setInsertFormat] = useState<"callout" | "inline">("callout");

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline font-medium hover:opacity-80 transition-colors",
          target: "_blank",
          rel: "noopener noreferrer"
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setRawHtml(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          "tiptap min-h-[380px] p-4 sm:p-6 focus:outline-none text-slate-800 dark:text-slate-200 text-base sm:text-lg leading-relaxed"
      }
    }
  });

  // Calculate position for floating selection menu (Bubble Menu)
  const updateBubbleMenu = useCallback(() => {
    if (!editor || !containerRef.current || isHtmlMode) {
      setBubbleMenuPos(null);
      return;
    }

    const { from, to } = editor.state.selection;
    if (from === to) {
      setBubbleMenuPos(null);
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setBubbleMenuPos(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      setBubbleMenuPos(null);
      return;
    }

    // Determine vertical position: above selection if space permits, else below
    let top = rect.top - containerRect.top - 50;
    if (top < 52) {
      top = rect.bottom - containerRect.top + 10;
    }

    // Keep horizontal position safely within container bounds
    const halfMenuWidth = 150;
    const maxLeft = containerRect.width - halfMenuWidth - 12;
    const minLeft = halfMenuWidth + 12;
    const centerSelection = rect.left - containerRect.left + rect.width / 2;
    const left = Math.max(minLeft, Math.min(maxLeft, centerSelection));

    setBubbleMenuPos({ top, left });
  }, [editor, isHtmlMode]);

  useEffect(() => {
    if (!editor) return;

    editor.on("selectionUpdate", updateBubbleMenu);
    editor.on("transaction", updateBubbleMenu);

    const handleScrollOrResize = () => updateBubbleMenu();
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      editor.off("selectionUpdate", updateBubbleMenu);
      editor.off("transaction", updateBubbleMenu);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [editor, updateBubbleMenu]);

  // Sync external value changes (e.g., initial article load in edit mode)
  useEffect(() => {
    if (!editor || value === undefined) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml && (value !== "" || currentHtml !== "<p></p>")) {
      editor.commands.setContent(value, { emitUpdate: false });
      setRawHtml(value);
    }
  }, [value, editor]);

  // Handle switching between Visual and HTML mode
  const handleToggleHtmlMode = () => {
    if (isHtmlMode) {
      if (editor) {
        editor.commands.setContent(rawHtml, { emitUpdate: false });
      }
      onChange(rawHtml);
      setIsHtmlMode(false);
    } else {
      if (editor) {
        setRawHtml(editor.getHTML());
      }
      setBubbleMenuPos(null);
      setIsHtmlMode(true);
    }
  };

  const handleRawHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawHtml(val);
    onChange(val);
  };

  // Standard Link Actions
  const openLinkModal = () => {
    if (!editor) return;
    savedSelectionRef.current = {
      from: editor.state.selection.from,
      to: editor.state.selection.to
    };
    const previousUrl = editor.getAttributes("link").href || "";
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );
    setLinkUrl(previousUrl);
    setLinkText(selectedText);
    setIsLinkModalOpen(true);
  };

  const saveLink = () => {
    if (!editor) return;

    // Restore saved selection
    if (savedSelectionRef.current) {
      editor.chain().focus().setTextSelection(savedSelectionRef.current).run();
    } else {
      editor.chain().focus().run();
    }

    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      let finalUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith("/")) {
        finalUrl = `https://${finalUrl}`;
      }

      if (linkText.trim() && editor.state.selection.empty) {
        editor.chain().focus().insertContent(`<a href="${finalUrl}">${linkText.trim()}</a> `).run();
      } else {
        editor.chain().focus().extendMarkRange("link").setLink({ href: finalUrl }).run();
      }
    }

    setIsLinkModalOpen(false);
    setLinkUrl("");
    setLinkText("");
    setBubbleMenuPos(null);
    savedSelectionRef.current = null;
  };

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setBubbleMenuPos(null);
  };

  // Internal Article Picker Actions
  const fetchArticles = useCallback(async (query: string) => {
    setLoadingArticles(true);
    try {
      const q = encodeURIComponent(query.trim());
      const res = await fetch(`/api/articles?q=${q}&status=published&limit=8`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (err) {
      console.error("Gagal memuat artikel terkait:", err);
    } finally {
      setLoadingArticles(false);
    }
  }, []);

  const openArticleModal = () => {
    if (!editor) return;
    savedSelectionRef.current = {
      from: editor.state.selection.from,
      to: editor.state.selection.to
    };
    setIsArticleModalOpen(true);
    setSearchQuery("");
    fetchArticles("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchArticles(query);
    }, 350);
  };

  const insertArticleLink = (article: ArticleItem) => {
    if (!editor) return;

    // Restore saved selection
    if (savedSelectionRef.current) {
      editor.chain().focus().setTextSelection(savedSelectionRef.current).run();
    } else {
      editor.chain().focus().run();
    }

    const categorySlug = article.categories?.[0]?.slug || "berita";
    const articleUrl = `/${categorySlug}/${article.slug}`;

    if (insertFormat === "callout") {
      const calloutHtml = `<p class="baca-juga-card"><strong>Baca Juga: </strong><a href="${articleUrl}" target="_blank" rel="noopener noreferrer">${article.title}</a></p><p></p>`;
      editor.chain().focus().insertContent(calloutHtml).run();
    } else {
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        " "
      );

      if (selectedText.trim()) {
        editor.chain().focus().extendMarkRange("link").setLink({ href: articleUrl }).run();
      } else {
        editor.chain().focus().insertContent(`<a href="${articleUrl}">${article.title}</a> `).run();
      }
    }

    setIsArticleModalOpen(false);
    setBubbleMenuPos(null);
    savedSelectionRef.current = null;
  };

  if (!editor) {
    return (
      <div className="h-64 flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Memuat Rich Text Editor...</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all"
    >
      {/* FLOATING SELECTION BUBBLE MENU (Appears above highlighted/selected text) */}
      {bubbleMenuPos && !isHtmlMode && (
        <div
          style={{
            top: `${bubbleMenuPos.top}px`,
            left: `${bubbleMenuPos.left}px`,
            transform: "translateX(-50%)"
          }}
          className="absolute z-30 flex items-center gap-1 p-1.5 bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/80 animate-in fade-in zoom-in-95 duration-100 max-w-[calc(100vw-32px)] overflow-x-auto no-scrollbar whitespace-nowrap"
        >
          {/* Format Besar/Kecil Tulisan */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().setParagraph().run();
            }}
            className={`px-2 py-1 rounded text-xs font-semibold transition cursor-pointer ${
              editor.isActive("paragraph") && !editor.isActive("heading")
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
            title="Teks Normal"
          >
            P
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            }}
            className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
              editor.isActive("heading", { level: 1 })
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
            title="Heading 1 (Besar)"
          >
            H1
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            }}
            className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
              editor.isActive("heading", { level: 2 })
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
            title="Heading 2 (Sedang)"
          >
            H2
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            }}
            className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
              editor.isActive("heading", { level: 3 })
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
            title="Heading 3 (Kecil)"
          >
            H3
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5 shrink-0" />

          {/* Bold */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBold().run();
            }}
            className={`p-1.5 rounded shrink-0 transition cursor-pointer ${
              editor.isActive("bold")
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
            title="Tebal (Bold)"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }}
            className={`p-1.5 rounded shrink-0 transition cursor-pointer ${
              editor.isActive("italic")
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
            title="Miring (Italic)"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleUnderline().run();
            }}
            className={`p-1.5 rounded shrink-0 transition cursor-pointer ${
              editor.isActive("underline")
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
            title="Garis Bawah (Underline)"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5 shrink-0" />

          {/* Link */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              openLinkModal();
            }}
            className={`p-1.5 rounded shrink-0 transition cursor-pointer ${
              editor.isActive("link")
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
            title="Beri Tautan Link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </button>

          {/* Tautkan Berita Terkait */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              openArticleModal();
            }}
            className="px-2 py-1 rounded text-xs font-semibold text-primary bg-primary/15 hover:bg-primary/25 transition cursor-pointer flex items-center gap-1 shrink-0"
            title="Tautkan ke Postingan Web Ini"
          >
            <Newspaper className="h-3 w-3" />
            <span className="text-[11px]">Tautkan Berita</span>
          </button>
        </div>
      )}

      {/* Main Top Sticky & Horizontally Scrollable Toolbar */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2 p-1.5 sm:p-2">
          {/* Main Editing Tools (Scrollable on mobile) */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-[calc(100%-80px)] sm:max-w-none">
            {/* Heading Group */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={`px-2.5 h-8 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer flex items-center gap-1 ${
                editor.isActive("paragraph") && !editor.isActive("heading")
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Paragraf Normal"
            >
              <Pilcrow className="h-3.5 w-3.5" />
              <span>P</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`px-2.5 h-8 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1 ${
                editor.isActive("heading", { level: 1 })
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Heading 1"
            >
              <Heading1 className="h-3.5 w-3.5" />
              <span>H1</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-2.5 h-8 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1 ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Heading 2"
            >
              <Heading2 className="h-3.5 w-3.5" />
              <span>H2</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`px-2.5 h-8 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1 ${
                editor.isActive("heading", { level: 3 })
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Heading 3"
            >
              <Heading3 className="h-3.5 w-3.5" />
              <span>H3</span>
            </button>

            <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

            {/* Inline Formatting */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition cursor-pointer ${
                editor.isActive("bold")
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Tebal (Bold)"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition cursor-pointer ${
                editor.isActive("italic")
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Miring (Italic)"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition cursor-pointer ${
                editor.isActive("underline")
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Garis Bawah (Underline)"
            >
              <UnderlineIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition cursor-pointer ${
                editor.isActive("strike")
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Coret (Strikethrough)"
            >
              <Strikethrough className="h-4 w-4" />
            </button>

            <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

            {/* Lists & Quotes */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition cursor-pointer ${
                editor.isActive("bulletList")
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Daftar Poin (Bullet List)"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition cursor-pointer ${
                editor.isActive("orderedList")
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Daftar Angka (Ordered List)"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition cursor-pointer ${
                editor.isActive("blockquote")
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Kutipan (Blockquote)"
            >
              <Quote className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Garis Pembatas (Horizontal Line)"
            >
              <Minus className="h-4 w-4" />
            </button>

            <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

            {/* Standard Link */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={openLinkModal}
              className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition cursor-pointer ${
                editor.isActive("link")
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Sisipkan Link URL"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
            {editor.isActive("link") && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={removeLink}
                className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                title="Hapus Link"
              >
                <Unlink className="h-4 w-4" />
              </button>
            )}

            {/* Internal Article Interlinker Button ("Baca Juga") */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={openArticleModal}
              className="px-2.5 h-8 rounded-lg shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer border border-primary/20"
              title="Tautkan Berita Terkait ('Baca Juga')"
            >
              <Newspaper className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Tautkan Berita</span>
              <span className="sm:hidden">Baca Juga</span>
            </button>

            <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

            {/* Undo / Redo */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </button>
          </div>

          {/* Toggle View Mode: Visual vs HTML */}
          <button
            type="button"
            onClick={handleToggleHtmlMode}
            className={`px-2.5 h-8 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1.5 cursor-pointer border ${
              isHtmlMode
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-300 dark:hover:border-slate-700"
            }`}
            title={isHtmlMode ? "Kembali ke Mode Visual" : "Edit Kode HTML Mentah"}
          >
            {isHtmlMode ? (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mode Visual</span>
              </>
            ) : (
              <>
                <Code className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Kode HTML</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {isHtmlMode ? (
        <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm">
          <div className="mb-2 flex items-center justify-between text-slate-400 text-xs">
            <span>Editor Kode HTML Mentah</span>
            <span>Tag HTML diizinkan: p, h1-h3, strong, em, ul, ol, blockquote, a, hr</span>
          </div>
          <textarea
            value={rawHtml}
            onChange={handleRawHtmlChange}
            className="w-full min-h-[380px] bg-transparent text-slate-100 focus:outline-none resize-y leading-relaxed font-mono"
            placeholder="Tulis kode HTML di sini..."
          />
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}

      {/* MODAL 1: Standard Link Insert / Edit */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                Sisipkan / Ubah Link
              </h3>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  URL Tujuan (Tautan Luar / Dalam):
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com atau /kategori/berita"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="mt-1"
                  autoFocus
                />
              </div>

              {editor.state.selection.empty && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Teks Tautan:
                  </label>
                  <Input
                    type="text"
                    placeholder="Contoh: Klik di sini"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLinkModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={saveLink}
                className="bg-primary text-white"
              >
                Simpan Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Tautkan Berita Internal / "Baca Juga" Picker */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-primary" />
                  Tautkan Berita Terkait
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih postingan yang sudah terbit untuk disisipkan ke dalam isi berita
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsArticleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input & Format Option */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Cari judul atau topik berita..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-9 bg-white dark:bg-slate-950 text-sm"
                  autoFocus
                />
              </div>

              {/* Format selection */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  Format Sisipan:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setInsertFormat("callout")}
                    className={`px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer flex items-center gap-1 ${
                      insertFormat === "callout"
                        ? "bg-primary text-white border-primary"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <BookOpen className="h-3 w-3" />
                    <span>Kotak &quot;Baca Juga&quot;</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInsertFormat("inline")}
                    className={`px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer flex items-center gap-1 ${
                      insertFormat === "inline"
                        ? "bg-primary text-white border-primary"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <LinkIcon className="h-3 w-3" />
                    <span>Tautan Teks Biasa</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Articles List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
              {loadingArticles ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs">Mencari artikel...</span>
                </div>
              ) : articles.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-1">
                  <p className="text-sm font-medium">Tidak ada berita yang cocok.</p>
                  <p className="text-xs">Coba kata kunci pencarian yang lain.</p>
                </div>
              ) : (
                articles.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => insertArticleLink(item)}
                    className="group p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-primary dark:hover:border-primary hover:shadow-sm cursor-pointer transition flex items-center gap-3"
                  >
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                        <Newspaper className="h-6 w-6" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.categories?.[0] && (
                          <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            {item.categories[0].name}
                          </span>
                        )}
                        {item.publishedAt && (
                          <span className="text-[11px] text-slate-400">
                            {new Date(item.publishedAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-primary transition mt-1">
                        {item.title}
                      </h4>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-primary group-hover:bg-primary group-hover:text-white shrink-0 rounded-lg text-xs"
                    >
                      Pilih
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsArticleModalOpen(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
