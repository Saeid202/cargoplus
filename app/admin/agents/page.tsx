"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createAgent, listAgents, type CreateAgentInput } from "@/app/actions/agent";

const inp = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white";

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const result = await listAgents();
    setAgents(result.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function reset() { setFullName(""); setEmail(""); setPassword(""); setPhone(""); setError(null); }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true); setError(null);
    const result = await createAgent({ email, password, full_name: fullName, phone: phone || null });
    setCreating(false);
    if (result.error) { setError(result.error); return; }
    reset(); setShowForm(false); load();
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500 mt-0.5">{agents.length} agent{agents.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); reset(); }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors">
          {showForm ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> Create Agent</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">New Agent Account</h2>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-xs font-medium text-gray-600">Full Name *</label><input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inp} /></div>
              <div className="space-y-1"><label className="text-xs font-medium text-gray-600">Email *</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inp} /></div>
              <div className="space-y-1"><label className="text-xs font-medium text-gray-600">Password *</label><input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inp} /></div>
              <div className="space-y-1"><label className="text-xs font-medium text-gray-600">Phone</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inp} /></div>
            </div>
            <button type="submit" disabled={creating}
              className="flex items-center gap-2 px-5 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors">
              {creating && <Loader2 className="h-4 w-4 animate-spin" />} Create Agent
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-orange-600" /></div>
        ) : agents.length === 0 ? (
          <p className="text-center py-16 text-sm text-gray-400">No agents yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{["Name", "Email", "Phone", "Created"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {agents.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{a.email}</td>
                  <td className="px-4 py-3 text-gray-600">{a.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(a.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
