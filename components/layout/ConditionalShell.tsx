"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";

const DASHBOARD_PREFIXES = ["/partner", "/admin", "/seller", "/account"];

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
      {children}
      {!isDashboard && <Footer />}
      {!isDashboard && <WhatsAppButton />}
    </>
  );
}
