"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Loader2, Eye } from "lucide-react";
import {
  adminGetAllProjects,
  adminGetProjectMessages,
  adminSendPartnerMessage,
  adminMarkMessagesRead,
} from "@/app/actions/engineering-messages";
import { ChatDrawer } from "@/components/engineering/ChatDrawer";

const BUDGET_LABELS: Record<string, string> = {
  under_100k: "Under $100k",
  "100k_300k": "$100k – $300k",
  "300k_plus": "$300k+",
};
const TYPE_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  in_review: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminEngineeringPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatProject, setChatProject] = useState<any | null>(null);
  const [viewProject, setViewProject] = useState<any | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await adminGetAllProjects();
    setProjects(result.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Engineering Projects</h1>
        <p className="text-sm text-gray-500 mt-0.5">{projects.length} total submissions</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
        ) : projects.length === 0 ? (
          <p className="text-center py-16 text-sm text-gray-400">No projects submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Project", "Company", "Location", "Type", "Budget", "Status", "Submitted", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate">{p.project_name}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{p.company_name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.project_location_city}, {p.project_location_province}</td>
                    <td className="px-4 py-3 text-gray-600">{TYPE_LABELS[p.project_type] ?? p.project_type}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{BUDGET_LABELS[p.budget_range] ?? p.budget_range}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          title="View Details"
                          onClick={() => setViewProject(p)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {/* Chat button with unread badge */}
                        <div className="relative">
                          <button
                            title="Reply"
                            onClick={() => setChatProject(p)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          {p.unread_count > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                              {p.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Project detail modal */}
      {viewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewProject(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{viewProject.project_name}</h2>
              <button onClick={() => setViewProject(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {[
              ["Company", viewProject.company_name],
              ["Contact", viewProject.full_name],
              ["Email", viewProject.email],
              ["Phone", viewProject.phone],
              ["City", viewProject.project_location_city],
              ["Province", viewProject.project_location_province],
              ["Type", TYPE_LABELS[viewProject.project_type]],
              ["Total Area", viewProject.total_area + " sqft/m²"],
              ["Floors", viewProject.number_of_floors],
              ["Length", viewProject.building_length + " m"],
              ["Width", viewProject.building_width + " m"],
              ["Height", viewProject.building_height ? viewProject.building_height + " m" : "—"],
              ["Structure", viewProject.structure_type],
              ["Delivery", viewProject.delivery_location],
              ["Budget", BUDGET_LABELS[viewProject.budget_range]],
              ["Description", viewProject.project_description ?? "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2 py-2 border-b border-gray-100 last:border-0">
                <span className="w-32 shrink-0 text-xs font-medium text-gray-500">{label}</span>
                <span className="text-sm text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat drawer */}
      {chatProject && (
        <ChatDrawer
          projectName={chatProject.project_name}
          projectId={chatProject.id}
          currentRole="partner"
          onClose={() => { setChatProject(null); load(); }}
          fetchMessages={adminGetProjectMessages}
          sendMessage={adminSendPartnerMessage}
          markRead={adminMarkMessagesRead}
        />
      )}
    </div>
  );
}
