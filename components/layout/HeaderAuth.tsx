"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { User, ChevronDown, LogOut, LayoutDashboard, Store } from "lucide-react";

export function HeaderAuth() {
  const supabase = createBrowserClient();
  const [user, setUser] = useState<{ id?: string; email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch session - role is stored in auth metadata (no DB query needed)
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      setUserRole(sessionUser?.user_metadata?.role ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      setUserRole(sessionUser?.user_metadata?.role ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <div className="w-24 h-9" />;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: "login" }))}
          className="inline-flex h-9 items-center justify-center rounded-xl border-2 border-white/30 px-4 text-sm font-semibold text-white transition-all hover:border-yellow-400 hover:text-yellow-300 hover:bg-white/10 cursor-pointer"
        >
          Login
        </button>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: "register" }))}
          className="inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-all cursor-pointer shadow-md"
          style={{ background: 'linear-gradient(135deg, #d4af37, #f5e27a)', color: '#3b0764' }}
        >
          Sign Up
        </button>
      </div>
    );
  }

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Account";

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 rounded-xl border-2 border-white/20 px-3 h-9 text-sm font-semibold text-white hover:bg-white/10 hover:border-yellow-400 transition-all cursor-pointer"
      >
        <User className="h-4 w-4 text-yellow-400" />
        <span className="max-w-[120px] truncate">{name}</span>
        <ChevronDown className="h-3 w-3 text-white/50" />
      </button>

      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-gray-200 bg-white shadow-lg py-1">
            {/* Role-based dashboard link */}
            {userRole === "seller" ? (
              <Link
                href="/seller/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Store className="h-4 w-4" />
                Seller Dashboard
              </Link>
            ) : userRole === "admin" ? (
              <Link
                href="/admin/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Dashboard
              </Link>
            ) : userRole === "partner" ? (
              <Link
                href="/partner/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <LayoutDashboard className="h-4 w-4" />
                Partner Dashboard
              </Link>
            ) : userRole === "agent" ? (
              <Link
                href="/agent/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <LayoutDashboard className="h-4 w-4" />
                Agent Dashboard
              </Link>
            ) : (
              <Link
                href="/account/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <LayoutDashboard className="h-4 w-4" />
                My Dashboard
              </Link>
            )}
            {/* Only show orders/profile for buyers */}
            {userRole !== "seller" && userRole !== "admin" && userRole !== "partner" && (
              <>
                <Link
                  href="/account/orders"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  My Orders
                </Link>
                <Link
                  href="/account/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  My Profile
                </Link>
              </>
            )}
            {/* Seller-specific links */}
            {userRole === "seller" && (
              <Link
                href="/seller/products"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                My Products
              </Link>
            )}
            <hr className="my-1 border-gray-100" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
