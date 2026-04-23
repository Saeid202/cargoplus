"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Eye, Download, Loader2, ClipboardList, Clock, TrendingUp, CheckCircle } from "lucide-react";
import { getAllOrdersForAgent, type AgentOrder } from "@/app/actions/agent";
import { jsPDF } from "jspdf";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:     { label: "Pending",     className: "bg-gray-100 text-gray-600 border border-gray-200" },
  in_progress: { label: "In Progress", className: "bg-orange-100 text-orange-700 border border-orange-200" },
  quoted:      { label: "Quoted",      className: "bg-violet-100 text-violet-700 border border-violet-200" },
  completed:   { label: "Completed",   className: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
};

const PRIORITY_COLORS = { high: "bg-red-500", medium: "bg-indigo-400", low: "bg-emerald-500" };

async function exportOrderPDF(order: AgentOrder) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  doc.setFontSize(16); doc.text(order.order_name, 14, 16);
  doc.setFontSize(9); doc.text(`Buyer: ${order.buyer_name ?? "—"} | ${order.buyer_email ?? "—"}`, 14, 23);
  doc.text(`Status: ${order.status} | Submitted: ${new Date(order.created_at).toLocaleDateString()}`, 14, 29);
  let y = 38;
  order.items.forEach((item, i) => {
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text(`${i + 1}. ${item.product_name}`, 14, y); y += 6;
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`Category: ${item.category} | Qty: ${item.quantity} ${item.unit} | Priority: ${item.priority}`, 14, y); y += 5;
    if (item.target_price) { doc.text(`Target: $${item.target_price}/unit`, 14, y); y += 5; }
    if (item.specification) { doc.text(`Spec: ${item.specification}`, 14, y); y += 5; }
    if (item.reference_link) { doc.text(`Ref: ${item.reference_link}`, 14, y); y += 5; }
    y += 3;
    if (y > 270) { doc.addPage(); y = 16; }
  });
  doc.save(`rfq-${order.order_name.replace(/\s+/g, "-")}.pdf`);
}

export default function AgentOrdersPage() {
  const [orders, setOrders] = useState<AgentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAllOrdersForAgent();
    setOrders(result.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">RFQ Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} total submissions</p>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {["all", "pending", "in_progress", "quoted", "completed"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                filter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20">
          <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            const highCount = order.items.filter((i) => i.priority === "high").length;
            const medCount  = order.items.filter((i) => i.priority === "medium").length;
            const lowCount  = order.items.filter((i) => i.priority === "low").length;
            return (
              <div key={order.id} className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all">
                <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-rose-500 to-red-500" />
                <div className="px-6 py-5 flex items-center gap-5">
                  <div className="shrink-0 h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-md shadow-orange-500/20">
                    <ClipboardList className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{order.order_name}</h3>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${status.className}`}>{status.label}</span>
                      {order.has_unread_response && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">New Reply</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {order.buyer_name ?? "Unknown"} · {order.buyer_email ?? "—"} · {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {order.items.slice(0, 3).map((item, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-600">{item.product_name}</span>
                      ))}
                      {order.items.length > 3 && <span className="px-2 py-0.5 rounded-lg text-[11px] bg-gray-100 text-gray-400">+{order.items.length - 3}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      {highCount > 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />{highCount} high</span>}
                      {medCount > 0  && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-400" />{medCount} medium</span>}
                      {lowCount > 0  && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />{lowCount} low</span>}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <Link href={`/agent/orders/${order.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-md shadow-orange-500/20 transition-all">
                      <Eye className="h-3.5 w-3.5" /> View & Reply
                    </Link>
                    <button onClick={() => exportOrderPDF(order)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all">
                      <Download className="h-3.5 w-3.5" /> PDF
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
