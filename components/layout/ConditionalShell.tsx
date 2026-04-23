"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";

interface ConditionalShellProps {
  children: React.ReactNode;
  cmsNav?: React.ReactNode;
}

export function ConditionalShell({ children, cmsNav }: ConditionalShellProps) {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <>
      {!isDashboard && <Header cmsNav={cmsNav} />}
      <main className="flex-1">{children}</main>
      {!isDashboard && <Footer />}
      {!isDashboard && <WhatsAppButton />}
    </>
  );
}

const DASHBOARD_PREFIXES = ["/partner", "/admin", "/seller", "/account"];
