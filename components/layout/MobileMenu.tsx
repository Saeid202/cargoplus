"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, ShoppingCart, User } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  cartItemCount: number;
  isAuthenticated: boolean;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenSellerAuth?: (mode: "login" | "register") => void;
}

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/seller/register", label: "Sell on CargoPlus" },
];

export function MobileMenu({
  isOpen,
  onClose,
  cartItemCount,
  isAuthenticated,
  onOpenLogin,
  onOpenRegister,
  onOpenSellerAuth,
}: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Menu panel */}
      <div
        ref={menuRef}
        className="absolute right-0 top-0 h-full w-80 max-w-[calc(100vw-4rem)] bg-background shadow-xl"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <span className="text-lg font-semibold">Menu</span>
            <button
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-muted transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navLinks.map((link) => {
                if (link.label === "Sell on CargoPlus") {
                  return (
                    <li key={link.href}>
                      <button
                        onClick={() => {
                          if (onOpenSellerAuth) {
                            onOpenSellerAuth("register");
                          }
                          onClose();
                        }}
                        className="flex min-h-[44px] w-full items-center rounded-lg px-4 text-base font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                      >
                        {link.label}
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="flex min-h-[44px] items-center rounded-lg px-4 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer actions */}
          <div className="border-t border-border p-4 space-y-3">
            <Link
              href="/cart"
              onClick={onClose}
              className="flex min-h-[44px] items-center justify-between rounded-lg px-4 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            >
              <span className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5" />
                Cart
              </span>
              {cartItemCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link
                href="/account/profile"
                onClick={onClose}
                className="flex min-h-[44px] items-center gap-3 rounded-lg px-4 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              >
                <User className="h-5 w-5" />
                My Account
              </Link>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { onClose(); onOpenLogin(); }}
                  className="flex flex-1 min-h-[44px] items-center justify-center rounded-lg border border-border text-base font-medium transition-colors hover:bg-muted"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { onClose(); onOpenRegister(); }}
                  className="flex flex-1 min-h-[44px] items-center justify-center rounded-lg bg-primary text-base font-medium text-primary-foreground transition-colors hover:bg-primary/80"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
