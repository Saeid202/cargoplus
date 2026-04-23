import PartnerSidebar from "@/components/layout/PartnerSidebar";
import { LogoutButton } from "./LogoutButton";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PartnerSidebar>
      <div className="flex items-center justify-end p-4 bg-white border-b">
        <LogoutButton />
      </div>
      {children}
    </PartnerSidebar>
  );
}
