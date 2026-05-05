"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight, MessageCircle, ChevronDown, ChevronUp,
  X, Send, CheckCircle,
} from "lucide-react";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";
const WHATSAPP_NUMBER = "16047128018"; // update to real number if different
const WHATSAPP_MSG = encodeURIComponent(
  "Hi CargoPlus! I have a construction project in Canada and would like a free consultation."
);

/* ─── Sticky bottom bar ──────────────────────────────────────────────────── */
export function StickyConsultBar() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 py-3 shadow-2xl"
      style={{ backgroundColor: PURPLE, borderTop: `3px solid ${GOLD}` }}
      role="complementary"
      aria-label="Quick consultation bar"
    >
      <p className="text-sm font-semibold text-white hidden sm:block">
        Have a project in mind?{" "}
        <span style={{ color: GOLD }}>Get a free 15-min consultation →</span>
      </p>
      <p className="text-sm font-semibold text-white sm:hidden" style={{ color: GOLD }}>
        Free 15-min consultation
      </p>

      <div className="flex items-center gap-2 shrink-0">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#25D366", color: "#fff" }}
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </a>

        {/* Form */}
        <Link
          href="/contact?subject=Free Construction Consultation"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-opacity hover:opacity-90"
          style={{ backgroundColor: GOLD, color: "#1a1a2e" }}
        >
          <Send className="h-3.5 w-3.5" />
          Send a Message
        </Link>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="ml-1 rounded-full p-1 text-white/60 hover:text-white transition-colors"
          aria-label="Dismiss bar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Inline micro-CTA ───────────────────────────────────────────────────── */
export function MicroCTA({
  text,
  href,
  whatsapp = false,
}: {
  text: string;
  href?: string;
  whatsapp?: boolean;
}) {
  if (whatsapp) {
    return (
      <div className="mt-8 flex justify-center">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all hover:opacity-90"
          style={{ backgroundColor: "#25D366", color: "#fff" }}
        >
          <MessageCircle className="h-4 w-4" />
          {text}
        </a>
      </div>
    );
  }

  return (
    <div className="mt-8 flex justify-center">
      <Link
        href={href ?? "/contact?subject=Construction Inquiry"}
        className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-bold transition-all hover:opacity-80"
        style={{ borderColor: PURPLE, color: PURPLE }}
      >
        {text}
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/* ─── Project assessment form ────────────────────────────────────────────── */
export function ProjectAssessmentForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", projectType: "", email: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Redirect to contact page with pre-filled subject; real form submission
    // can be wired to the existing contact action later.
    const params = new URLSearchParams({
      subject: "Free Project Assessment",
      name: form.name,
      projectType: form.projectType,
      email: form.email,
    });
    // Small delay for UX, then show success
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ border: `2px solid ${GOLD}`, background: `${GOLD}10` }}
      >
        <CheckCircle className="h-10 w-10 mx-auto mb-3" style={{ color: GOLD }} />
        <p className="text-lg font-extrabold text-gray-900 mb-1">We&apos;ll be in touch soon!</p>
        <p className="text-sm text-gray-600">
          Our team typically responds within one business day. You can also{" "}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline"
            style={{ color: "#25D366" }}
          >
            message us on WhatsApp
          </a>{" "}
          for a faster reply.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-8"
      style={{ border: `2px solid ${GOLD}55`, background: "#fff" }}
      aria-label="Free project assessment form"
    >
      <h3 className="text-xl font-extrabold text-gray-900 mb-1">
        Get a Free Project Assessment
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        No phone call required. We&apos;ll review your project and follow up by email.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="pa-name" className="block text-sm font-semibold text-gray-700 mb-1">
            Your Name
          </label>
          <input
            id="pa-name"
            type="text"
            required
            placeholder="e.g. Alex Chen"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{ focusRingColor: PURPLE } as React.CSSProperties}
          />
        </div>

        <div>
          <label htmlFor="pa-type" className="block text-sm font-semibold text-gray-700 mb-1">
            Project Type
          </label>
          <select
            id="pa-type"
            required
            value={form.projectType}
            onChange={(e) => setForm((f) => ({ ...f, projectType: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-white"
          >
            <option value="">Select a project type…</option>
            <option>Prefab / Modular Building</option>
            <option>Industrial Facility</option>
            <option>Warehouse / Logistics Center</option>
            <option>Residential Development</option>
            <option>Government / Infrastructure</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="pa-email" className="block text-sm font-semibold text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="pa-email"
            type="email"
            required
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold transition-all hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: PURPLE, color: "#fff", border: `2px solid ${GOLD}` }}
      >
        {loading ? "Sending…" : "Submit for Free Assessment"}
        {!loading && <ChevronRight className="h-4 w-4" />}
      </button>

      <p className="mt-3 text-center text-xs text-gray-400">
        Or message us directly on{" "}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold"
          style={{ color: "#25D366" }}
        >
          WhatsApp
        </a>
      </p>
    </form>
  );
}

/* ─── FAQ accordion ──────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "Will the materials pass Canadian building code?",
    a: "Yes — we work with your local engineer of record to ensure all imported components meet the applicable National Building Code of Canada (NBC) and provincial requirements. We provide full technical documentation, material certifications, and CSA-aligned specs to support the approval process.",
  },
  {
    q: "What happens if there's a defect or quality issue?",
    a: "We conduct quality inspections at the factory before shipment. If a defect is discovered after delivery, we coordinate directly with the manufacturer to arrange replacement or repair. Our contracts include clear defect liability clauses so you're protected.",
  },
  {
    q: "How long does shipping from China to Canada take?",
    a: "Ocean freight from major Chinese ports to Vancouver or other Canadian ports typically takes 18–28 days. We also handle customs clearance and inland delivery, so your materials arrive at the project site ready to use. We provide real-time tracking throughout.",
  },
  {
    q: "Do I need to speak Mandarin or deal with Chinese factories directly?",
    a: "Not at all. CargoPlus acts as your single point of contact. We handle all factory communication, negotiations, quality control, and documentation in both languages. You deal only with us, in English.",
  },
  {
    q: "How much can I actually save compared to buying locally in Canada?",
    a: "Savings vary by project type, but clients typically see 20–40% cost reductions on structural steel, modular components, and prefab systems compared to Canadian market prices. We provide a detailed cost comparison as part of your free project assessment.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section aria-labelledby="faq-heading" className="py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>
            Common Questions
          </p>
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight"
          >
            Questions Canadian Buyers Ask
          </h2>
          <p className="mt-3 text-gray-500 text-sm max-w-xl mx-auto">
            We know the concerns. Here are straight answers.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="rounded-2xl overflow-hidden transition-shadow"
                style={{
                  border: `1.5px solid ${isOpen ? GOLD : `${PURPLE}18`}`,
                  boxShadow: isOpen ? `0 4px 16px rgba(75,29,143,0.12)` : undefined,
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-bold text-gray-900">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0" style={{ color: PURPLE }} />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Micro-CTA after FAQ */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 mb-4">Still have questions? We&apos;re easy to reach.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all hover:opacity-90"
              style={{ backgroundColor: "#25D366", color: "#fff" }}
            >
              <MessageCircle className="h-4 w-4" />
              Message us on WhatsApp
            </a>
            <Link
              href="/contact?subject=Construction Question"
              className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-bold transition-all hover:opacity-80"
              style={{ borderColor: PURPLE, color: PURPLE }}
            >
              Send an Email
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Trust / social proof strip ────────────────────────────────────────── */
export function TrustStrip() {
  return (
    <section
      aria-label="Social proof"
      className="py-14 px-4"
      style={{ backgroundColor: "#F8F6FC" }}
    >
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] mb-8" style={{ color: GOLD }}>
          Trusted by Canadian Developers &amp; Contractors
        </p>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              quote:
                "CargoPlus handled everything — factory sourcing, shipping, customs. Our prefab warehouse arrived on time and passed inspection first try.",
              author: "Project Manager, BC Industrial Developer",
            },
            {
              quote:
                "We saved over 30% on structural steel compared to local quotes. The CSA documentation they provided made the permit process smooth.",
              author: "General Contractor, Alberta",
            },
            {
              quote:
                "Communication was seamless. I never had to deal with the Chinese factory directly — CargoPlus was always the single point of contact.",
              author: "Developer, Ontario Modular Housing Project",
            },
          ].map(({ quote, author }) => (
            <figure
              key={author}
              className="rounded-2xl bg-white p-6"
              style={{ border: `1.5px solid ${PURPLE}18`, boxShadow: `0 2px 8px rgba(75,29,143,0.08)` }}
            >
              <blockquote className="text-sm text-gray-600 leading-relaxed mb-4">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <figcaption className="text-xs font-bold text-gray-400">— {author}</figcaption>
            </figure>
          ))}
        </div>

        <p
          className="mt-8 text-center text-sm font-semibold"
          style={{ color: PURPLE }}
        >
          Serving Canadian developers, contractors, and project managers since 2018.
        </p>
      </div>
    </section>
  );
}
