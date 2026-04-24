"use client";

import { useState } from "react";
import { Search, Eye, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";

const PURPLE = "#4B1D8F";

const orders = [
  { id: "ORD-001", customer: "John Doe", email: "john@example.com", date: "2024-01-15", total: 299.99, status: "pending", items: 3 },
  { id: "ORD-002", customer: "Jane Smith", email: "jane@example.com", date: "2024-01-14", total: 149.99, status: "processing", items: 2 },
  { id: "ORD-003", customer: "Bob Johnson", email: "bob@example.com", date: "2024-01-13", total: 449.99, status: "shipped", items: 5 },
  { id: "ORD-004", customer: "Alice Brown", email: "alice@example.com", date: "2024-01-12", total: 89.99, status: "delivered", items: 1 },
];

const statusConfig: Record<string, { icon: any; bg: string; text: string; label: string }> = {
  pending:    { icon: Clock,        bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
  processing: { icon: Package,      bg: "bg-blue-100",   text: "text-blue-700",   label: "Processing" },
  shipped:    { icon: Truck,        bg: "bg-purple-100", text: "text-purple-700", label: "Shipped" },
  delivered:  { icon: CheckCircle,  bg: "bg-green-100",  text: "text-green-700",  label: "Delivered" },
  cancelled:  { icon: XCircle,      bg: "bg-red-100",    text: "text-red-700",    label: "Cancelled" },
};

export default function SellerOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (statusFilter === "all" || o.status === statusFilter);
  });

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Orders Management</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] bg-white"
            >
              <option value="all">All Status</option>
              {Object.entries(statusConfig).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#F5F4F7" }}>
                {["Order ID", "Customer", "Date", "Items", "Total", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => {
                const cfg = statusConfig[order.status] ?? statusConfig.pending;
                const Icon = cfg.icon;
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-gray-900">{order.id}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{order.customer}</p>
                      <p className="text-xs text-gray-400">{order.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{order.date}</td>
                    <td className="px-5 py-3.5 text-gray-500">{order.items}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">${order.total.toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${cfg.bg} ${cfg.text}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                        style={{ color: PURPLE }}
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-14 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ backgroundColor: "#EDE9F6" }}>
              <Package className="h-7 w-7" style={{ color: PURPLE }} />
            </div>
            <p className="font-semibold text-gray-900">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
