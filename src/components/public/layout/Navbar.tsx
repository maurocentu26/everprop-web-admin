"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
};

type NavbarProps = {
  companyName?: string;
  logoSrc?: string;
  navItems?: NavItem[];
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  className?: string;
};

const defaultNavItems: NavItem[] = [
  { label: "Propiedades", href: "#propiedades" },
  { label: "Servicios", href: "#servicios" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "Contacto", href: "#contacto" },
];

export function Navbar({
  companyName = "EverProp",
  logoSrc,
  navItems = defaultNavItems,
  primaryCtaLabel = "Solicitar demo",
  primaryCtaHref = "#contacto",
  secondaryCtaLabel = "Explorar",
  secondaryCtaHref = "#propiedades",
  className,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm shadow-slate-950/10">
            {logoSrc ? (
              <img src={logoSrc} alt={`${companyName} logo`} className="h-6 w-6 object-contain" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-slate-950">{companyName}</span>
            <span className="text-xs text-slate-500">Premium real estate SaaS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href={secondaryCtaHref}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
          >
            {secondaryCtaLabel}
          </Link>
          <Link
            href={primaryCtaHref}
            className={cn(buttonVariants({ variant: "default", size: "default" }), "inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition-transform hover:-translate-y-0.5 hover:bg-slate-800")}
          >
            <Sparkles className="h-4 w-4" />
            {primaryCtaLabel}
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((value) => !value)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-slate-200/70 bg-white px-4 pb-4 pt-2 lg:hidden",
          mobileMenuOpen ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <Link
              href={secondaryCtaHref}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {secondaryCtaLabel}
            </Link>
            <Link
              href={primaryCtaHref}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              {primaryCtaLabel}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
