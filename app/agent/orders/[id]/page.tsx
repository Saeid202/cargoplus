"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Download, Send, Paperclip, FileText, Loader2,
  User, Phone, Mail, Package, MessageSquare, ClipboardList, X
} from "lucide-react";
import {
  getOrderDetailForAgent, submitAgentResponse, getOrderMessages,
  sendAgentMessage, markOrderMessagesRead, updateOrderStatus,
  type AgentOrder, type AgentResponse, type AgentMessage,
} from "@/app/actions/agent";

const STATUS_OPTIONS = ["pending", "in_progress", "quoted", "completed"];
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:     { label: "Pending",     className: "bg-gray-100 text-gray-600" },
  in_progress: { label: "In Progress", className: "bg-orange-100 text-orange-700" },
  quoted:      { label: "Quoted",      className: "bg-violet-100 text-violet-700" },
  completed:   { label: "Completed",   className: "bg-emerald-100 text-emerald-700" },
};
const BUDGET_LABELS: Record<string, string> = { under_100k: "Under $100k", "100k_300k": "$100k–$300k", "300k_plus": "$300k+" };
const inp = "w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-white transition-colors";

export default function AgentOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<AgentOrder | null>(null);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Quote form state
  const [supplierName, setSupplierName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [leadTime, setLeadTime] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("in_progress");
  const [quoteFiles, setQuoteFiles] = useState<File[]>([]);
  const [savingQuote, setSavingQuote] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Message state
  const [msgText, setMsgText] = useState("");
  const [msgFiles, setMsgFiles] = useState<File[]>([]);
  const [sendingMsg, setSendingMsg] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const [detail, msgs] = await Promise.all([
      getOrderDetailForAgent(id),
      getOrderMessages(id),
    ]);
    if (detail.order) {
      setOrder(detail.order);
      setImages(detail.images);
      if (detail.response) {
        setResponse(detail.response);
        setSupplierName(detail.response.supplier_name ?? "");
        setUnitPrice(detail.response.unit_price?.toString() ?? "");
        setLeadTime(detail.response.lead_time_days?.toString() ?? "");
        setQuoteNotes(detail.response.notes ?? "");
        setStatusUpdate(detail.response.status_update);
      }
    }
    setMessages(msgs);
    await markOrderMessagesRead(id);
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingQuote(true); setQuoteError(null); setQuoteSuccess(false);

    const attachments: { name: string; base64: string; type: string }[] = [];
    for (const file of quoteFiles) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });
      attachments.push({ name: file.name, base64, type: file.type });
    }

    const result = await submitAgentResponse(id, {
      supplier_name: supplierName || null,
      unit_price: unitPrice ? parseFloat(unitPrice) : null,
      lead_time_days: leadTime ? parseInt(leadTime) : null,
      notes: quoteNotes || null,
      status_update: statusUpdate,
    }, attachments);

    setSavingQuote(false);
    if (result.error) { setQuoteError(result.error); return; }
    setQuoteSuccess(true);
    setQuoteFiles([]);
    load();
  }

  async function handleSendMessage() {
    if (!msgText.trim() && msgFiles.length === 0) return;
    setSendingMsg(true);

    const attachments: { name: string; base64: string; type: string }[] = [];
    for (const file of msgFiles) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });
      attachments.push({ name: file.name, base64, type: file.type });
    }

    await sendAgentMessage(id, msgText.trim() || null, attachments);
    setMsgText(""); setMsgFiles([]);
    setSendingMsg(false);
    load();
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>;
  if (!order) return <div className="text-center py-20 text-gray-400">Order not found.</div>;

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/agent/orders" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="h-4 w-4 text-orange-400" />
              <span className="text-orange-300 text-xs font-semibold uppercase tracking-widest">RFQ Order</span>
            </div>
            <h1 className="text-xl font-bold mb-1">{order.order_name}</h1>
            <p className="text-gray-400 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${status.className}`}>{status.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Buyer info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100 flex items-center gap-2">
            <User className="h-4 w-4 text-violet-600" />
            <h2 className="text-xs font-bold text-violet-900 uppercase tracking-wide">Buyer Contact</h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {order.buyer_name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{order.buyer_name ?? "—"}</p>
              </div>
            </div>
            {order.buyer_email && (
              <a href={`mailto:${order.buyer_email}`} className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-sm text-blue-700 font-medium">{order.buyer_email}</span>
              </a>
            )}
            {(order as any).buyer_phone && (
              <a href={`tel:${(order as any).buyer_phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                <Phone className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-sm text-green-700 font-medium">{(order as any).buyer_phone}</span>
              </a>
            )}
          </div>
        </div>

        {/* Product lines */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gradient-to-r from-orange-50 to-rose-50 border-b border-orange-100 flex items-center gap-2">
            <Package className="h-4 w-4 text-orange-600" />
            <h2 className="text-xs font-bold text-orange-900 uppercase tracking-wide">Product Lines ({order.items.length})</h2>
          </div>
          <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
            {order.items.map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-gray-900 text-sm">{item.product_name}</p>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    item.priority === "high" ? "bg-red-100 text-red-700" : item.priority === "medium" ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"
                  }`}>{item.priority}</span>
                </div>
                <p className="text-xs text-gray-500">{item.category} · {item.quantity} {item.unit}{item.target_price ? ` · $${item.target_price}/unit` : ""}</p>
                {item.specification && <p className="text-xs text-gray-400 mt-0.5">{item.specification}</p>}
                {item.reference_link && (
                  <a href={item.reference_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-0.5 block truncate">{item.reference_link}</a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sample images */}
      {images.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100 flex items-center gap-2">
            <Package className="h-4 w-4 text-cyan-600" />
            <h2 className="text-xs font-bold text-cyan-900 uppercase tracking-wide">Sample Images</h2>
          </div>
          <div className="p-4 flex flex-wrap gap-3">
            {images.map((img: any) => (
              <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer">
                <img src={img.url} alt={img.file_name} className="h-20 w-20 rounded-xl object-cover border border-gray-100 hover:opacity-80 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Message thread */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-600" />
          <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Message Thread</h2>
        </div>
        <div className="p-4 max-h-72 overflow-y-auto space-y-2">
          {messages.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-6">No messages yet. Start the conversation.</p>
          ) : messages.map((msg) => {
            const isAgent = msg.sender_role === "agent";
            return (
              <div key={msg.id} className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isAgent ? "bg-gradient-to-br from-orange-500 to-rose-500 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                  <p className={`text-[10px] font-bold mb-1 ${isAgent ? "text-orange-100" : "text-gray-400"}`}>{isAgent ? "You (Agent)" : "Buyer"}</p>
                  {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                  {msg.files.map((f) => (
                    <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-xs underline mt-1 ${isAgent ? "text-orange-100" : "text-blue-500"}`}>
                      <FileText className="h-3 w-3" />{f.file_name}
                    </a>
                  ))}
                  <p className={`text-[10px] mt-1 ${isAgent ? "text-orange-200" : "text-gray-400"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        {/* Message input */}
        {msgFiles.length > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {msgFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 text-xs text-gray-700">
                <FileText className="h-3 w-3" /><span className="max-w-[100px] truncate">{f.name}</span>
                <button onClick={() => setMsgFiles((p) => p.filter((_, j) => j !== i))} className="ml-1 text-gray-400 hover:text-red-500"><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        )}
        <div className="px-4 pb-4 flex items-end gap-2">
          <div className="flex-1 flex items-end gap-2 border-2 border-gray-200 rounded-xl px-3 py-2 focus-within:border-orange-400 transition-colors">
            <textarea value={msgText} onChange={(e) => setMsgText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              rows={1} placeholder="Type a message… (Enter to send)"
              className="flex-1 resize-none text-sm outline-none bg-transparent max-h-24 text-gray-800 placeholder-gray-400" />
            <label className="cursor-pointer text-gray-400 hover:text-orange-500 shrink-0">
              <Paperclip className="h-4 w-4" />
              <input type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) setMsgFiles((p) => [...p, ...Array.from(e.target.files!)]); }} />
            </label>
          </div>
          <button onClick={handleSendMessage} disabled={sendingMsg || (!msgText.trim() && msgFiles.length === 0)}
            className="h-10 w-10 flex items-center justify-center bg-gradient-to-br from-orange-500 to-rose-500 text-white rounded-xl hover:from-orange-600 hover:to-rose-600 disabled:opacity-40 shadow-md shadow-orange-500/25 transition-all shrink-0">
            {sendingMsg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Quote / Response form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
            {response ? "Update Quote" : "Submit Quote"}
          </h2>
          {response && <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Quote on file</span>}
        </div>
        <form onSubmit={handleQuoteSubmit} className="p-5 space-y-4">
          {quoteSuccess && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">Quote saved successfully.</div>}
          {quoteError && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{quoteError}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Supplier Name</label>
              <input type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="e.g. Shenzhen Co. Ltd" className={inp} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unit Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
                <input type="number" min={0} step="any" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="0.00" className={inp + " pl-7"} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lead Time (days)</label>
              <input type="number" min={0} value={leadTime} onChange={(e) => setLeadTime(e.target.value)} placeholder="e.g. 30" className={inp} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status Update *</label>
              <select value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)} className={inp}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Attach Files (PDF, Excel)</label>
              <label className="flex items-center gap-2 px-3 py-2.5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors text-sm text-gray-400">
                <Paperclip className="h-4 w-4" /> Choose files…
                <input type="file" multiple accept=".pdf,.xls,.xlsx" className="hidden" onChange={(e) => { if (e.target.files) setQuoteFiles((p) => [...p, ...Array.from(e.target.files!)]); }} />
              </label>
              {quoteFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {quoteFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 text-xs text-gray-700">
                      <FileText className="h-3 w-3" /><span className="max-w-[100px] truncate">{f.name}</span>
                      <button type="button" onClick={() => setQuoteFiles((p) => p.filter((_, j) => j !== i))} className="ml-1 text-gray-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Notes</label>
            <textarea rows={3} value={quoteNotes} onChange={(e) => setQuoteNotes(e.target.value)}
              placeholder="Sourcing notes, conditions, remarks…" className={inp + " resize-none"} />
          </div>

          {/* Existing response files */}
          {response?.files && response.files.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Previously Uploaded Files</label>
              <div className="flex flex-wrap gap-2">
                {response.files.map((f: any) => (
                  <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 hover:bg-emerald-100 transition-colors">
                    <Download className="h-3.5 w-3.5" />{f.file_name}
                  </a>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={savingQuote}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 shadow-lg shadow-emerald-500/20 transition-all">
            {savingQuote && <Loader2 className="h-4 w-4 animate-spin" />}
            {response ? "Update Quote" : "Submit Quote"}
          </button>
        </form>
      </div>
    </div>
  );
}
