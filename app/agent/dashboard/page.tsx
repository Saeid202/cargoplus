import { ClipboardList, Clock, TrendingUp, CheckCircle, Briefcase, ArrowRight } from "lucide-react";
import { getAgentDashboardStats } from "@/app/actions/agent";
import Link from "next/link";

export default async function AgentDashboardPage() {
  const stats = await getAgentDashboardStats();

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-rose-600 to-red-700 p-8 text-white shadow-2xl shadow-orange-500/20">
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute right-20 -bottom-10 h-36 w-36 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg shrink-0">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="text-orange-100 text-sm font-medium mb-1">Agent Portal</p>
            <h1 className="text-2xl font-black">Consolidation / RFQ Orders</h1>
            <p className="text-orange-100 text-sm mt-1">Review buyer requests, source products, and send quotes.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Total",       value: stats.total,       icon: ClipboardList, gradient: "from-blue-500 to-indigo-600",   shadow: "shadow-blue-500/20" },
          { label: "Pending",     value: stats.pending,     icon: Clock,         gradient: "from-gray-400 to-gray-500",     shadow: "shadow-gray-400/20" },
          { label: "In Progress", value: stats.in_progress, icon: TrendingUp,    gradient: "from-orange-500 to-rose-500",   shadow: "shadow-orange-500/20" },
          { label: "Quoted",      value: stats.quoted,      icon: Briefcase,     gradient: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/20" },
          { label: "Completed",   value: stats.completed,   icon: CheckCircle,   gradient: "from-emerald-500 to-teal-600",  shadow: "shadow-emerald-500/20" },
        ].map(({ label, value, icon: Icon, gradient, shadow }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadow} mb-3`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <p className="text-3xl font-black text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick action */}
      <Link href="/agent/orders"
        className="group flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-md shadow-orange-500/25">
            <ClipboardList className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">View All Orders</p>
            <p className="text-sm text-gray-400">Review and respond to buyer RFQ submissions</p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
      </Link>
    </div>
  );
}
