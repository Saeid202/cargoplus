"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Paperclip, Send, Download, Loader2, FileText } from "lucide-react";
import type { ProjectMessage } from "@/app/actions/engineering-messages";

interface ChatDrawerProps {
  projectName: string;
  projectId: string;
  currentRole: "customer" | "partner";
  onClose: () => void;
  fetchMessages: (id: string) => Promise<{ data: ProjectMessage[]; error: string | null }>;
  sendMessage: (id: string, msg: string | null, files: { name: string; base64: string; type: string }[]) => Promise<{ error: string | null }>;
  markRead: (id: string) => Promise<void>;
}

export function ChatDrawer({
  projectName, projectId, currentRole, onClose,
  fetchMessages, sendMessage, markRead,
}: ChatDrawerProps) {
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const load = useCallback(async () => {
    const result = await fetchMessages(projectId);
    if (!result.error) {
      setMessages(result.data);
      await markRead(projectId);
    }
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [projectId, fetchMessages, markRead]);

  useEffect(() => {
    load();
    // Poll every 8 seconds for new messages
    pollRef.current = setInterval(load, 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [load]);

  async function handleSend() {
    if (!text.trim() && files.length === 0) return;
    setSending(true);
    setError(null);

    const attachments: { name: string; base64: string; type: string }[] = [];
    for (const file of files) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });
      attachments.push({ name: file.name, base64, type: file.type });
    }

    const result = await sendMessage(projectId, text.trim() || null, attachments);
    setSending(false);
    if (result.error) { setError(result.error); return; }
    setText("");
    setFiles([]);
    load();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const grouped = groupByDate(messages);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Project Thread</p>
            <h2 className="font-semibold text-gray-900 truncate max-w-[280px]">{projectName}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {loading ? (
            <div className="flex justify-center pt-8"><Loader2 className="h-5 w-5 animate-spin text-blue-500" /></div>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-gray-400 pt-8">No messages yet. Start the conversation.</p>
          ) : (
            grouped.map(({ date, msgs }) => (
              <div key={date}>
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">{date}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                {msgs.map((msg) => {
                  const isMe = msg.sender_role === currentRole;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}>
                        <p className={`text-xs font-semibold mb-1 ${isMe ? "text-blue-100" : "text-gray-500"}`}>
                          {msg.sender_role === "partner" ? "Partner" : "You"}
                        </p>
                        {msg.message && <p className="text-sm whitespace-pre-wrap">{msg.message}</p>}
                        {msg.files.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.files.map((f) => (
                              <a
                                key={f.id}
                                href={f.signed_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-1.5 text-xs underline ${isMe ? "text-blue-100" : "text-blue-600"}`}
                              >
                                <FileText className="h-3.5 w-3.5 shrink-0" />
                                {f.file_name}
                              </a>
                            ))}
                          </div>
                        )}
                        <p className={`text-xs mt-1 ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Attached files preview */}
        {files.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 text-xs text-gray-700">
                <FileText className="h-3 w-3" />
                <span className="max-w-[120px] truncate">{f.name}</span>
                <button onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} className="ml-1 text-gray-400 hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && <p className="px-4 py-1 text-xs text-red-600 bg-red-50">{error}</p>}

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
          <div className="flex items-end gap-2">
            <div className="flex-1 flex items-end gap-2 border border-gray-300 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                placeholder="Type a message… (Enter to send)"
                className="flex-1 resize-none text-sm outline-none bg-transparent max-h-32"
              />
              <label className="cursor-pointer text-gray-400 hover:text-blue-600 shrink-0">
                <Paperclip className="h-4 w-4" />
                <input type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) setFiles((p) => [...p, ...Array.from(e.target.files!)]); }} />
              </label>
            </div>
            <button
              onClick={handleSend}
              disabled={sending || (!text.trim() && files.length === 0)}
              className="flex items-center justify-center h-10 w-10 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 shrink-0"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Group messages by date ────────────────────────────────────────────────────
function groupByDate(messages: ProjectMessage[]) {
  const map = new Map<string, ProjectMessage[]>();
  for (const msg of messages) {
    const date = new Date(msg.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(msg);
  }
  return Array.from(map.entries()).map(([date, msgs]) => ({ date, msgs }));
}
