"use client";

import Link from "next/link";

interface NavigationProps {
  className?: string;
  onLinkClick?: () => void;
  onOpenSellerAuth?: (mode: "login" | "register") => void;
}

const navLinks = [
  { href: "/about",     label: "About Us" },
  { href: "/products",  label: "Products" },
  { href: "/contact",   label: "Contact Us" },
];

export function Navigation({ className, onLinkClick }: NavigationProps) {
  return (
    <nav className={className}>
      <ul className="flex items-center gap-1">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={() => onLinkClick?.()}
              className="relative text-sm font-semibold text-purple-100 transition-all hover:text-yellow-300 min-h-[44px] flex items-center px-4 py-2 rounded-xl hover:bg-white/10 group"
            >
              {link.label}
              <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-yellow-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
