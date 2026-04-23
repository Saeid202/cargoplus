"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, X } from "lucide-react";
import {
  listPartners,
  createPartner,
  updatePartnerStatus,
  type CreatePartnerInput,
} from "@/app/actions/partner-admin";
import type { Partner } from "@/types/database";

const inp =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const result = await listPartners();
    setPartners(result.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setEmail(""); setPassword(""); setCompanyName(""); setContactName(""); setPhone("");
    setCreateError(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    const input: CreatePartnerInput = {
      email,
      password,
      company_name: companyName,
      contact_name: contactName,
      phone: phone.trim() || null,
    };

    const result = await createPartner(input);
    setCreating(false);

    if (result.error) {
      setCreateError(result.error);
      return;
    }

    resetForm();
    setShowForm(false);
    load();
  }

  async function handleToggleStatus(partner: Partner) {
    setTogglingId(partner.id);
    const newStatus = partner.status === "active" ? "suspended" : "active";
    await updatePartnerStatus(partner.id, newStatus);
    setTogglingId(null);
    load();
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
          <p className="text-sm text-gray-500 mt-0.5">{partners.length} partner{partners.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> Create Partner</>}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">New Partner Account</h2>
          {createError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {createError}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Email *</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inp} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Password *</label>
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inp} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Company Name *</label>
                <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inp} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Contact Name *</label>
                <input type="text" required value={contactName} onChange={(e) => setContactName(e.target.value)} className={inp} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inp} />
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Partner
            </button>
          </form>
        </div>
      )}

      {/* Partners table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : partners.length === 0 ? (
          <p className="text-center py-16 text-sm text-gray-400">No partners yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Company", "Contact", "Email", "Status", "Created", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {partners.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.company_name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.contact_name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        p.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        disabled={togglingId === p.id}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        {togglingId === p.id && <Loader2 className="h-3 w-3 animate-spin" />}
                        {p.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
