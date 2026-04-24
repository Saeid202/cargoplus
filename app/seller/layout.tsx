import SellerSidebar from "@/components/layout/SellerSidebar";
import { LogoutButton } from "./LogoutButton";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SellerSidebar>
      <div className="flex items-center justify-end px-4 py-2 bg-white border-b border-gray-100">
        <LogoutButton />
      </div>
      {children}
    </SellerSidebar>
  );
}
