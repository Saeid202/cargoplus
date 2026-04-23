import SellerSidebar from "@/components/layout/SellerSidebar";
import { LogoutButton } from "./LogoutButton";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth is handled by middleware - no need to fetch profile here
  // Profile data is fetched by individual pages that need it
  
  return (
    <SellerSidebar>
      <div className="flex items-center justify-end p-4 bg-white border-b">
        <LogoutButton />
      </div>
      {children}
    </SellerSidebar>
  );
}
