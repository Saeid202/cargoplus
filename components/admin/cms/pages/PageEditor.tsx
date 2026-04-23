"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import { PageEditorToolbar } from "./PageEditorToolbar";

interface PageEditorProps {
  initialContent: string;
  onSave: (html: string) => Promise<void>;
  lastSaved?: string | null;
}

export function PageEditor({ initialContent, onSave, lastSaved }: PageEditorProps) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(lastSaved ?? null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Heading.configure({ levels: [1, 2, 3] }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-gray max-w-none min-h-[400px] p-4 focus:outline-none",
      },
    },
  });

  async function handleSave() {
    if (!editor) return;
    const html = editor.getHTML();
    if (editor.isEmpty || html === "<p></p>") {
      setSaveError("Content cannot be empty");
      return;
    }
    setSaveError("");
    setSaving(true);
    try {
      await onSave(html);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (err: any) {
      setSaveError(err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <PageEditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
        <div className="text-sm">
          {saveError && <span className="text-red-500">{saveError}</span>}
          {!saveError && savedAt && (
            <span className="text-gray-400">Saved at {savedAt}</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
