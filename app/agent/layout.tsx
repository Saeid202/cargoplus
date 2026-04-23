import AgentSidebar from "@/components/layout/AgentSidebar";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <AgentSidebar>{children}</AgentSidebar>;
}
