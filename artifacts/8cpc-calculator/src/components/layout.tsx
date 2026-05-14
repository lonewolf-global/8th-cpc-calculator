import { Link, useLocation } from "wouter";
import { Calculator, Table, CalendarClock, Info as InfoIcon, Menu, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/",           label: "Calculator",     icon: Calculator },
    { href: "/pay-matrix", label: "Pay Matrix",     icon: Table },
    { href: "/arrears",    label: "Arrears",        icon: CalendarClock },
    { href: "/pension",    label: "Pension",        icon: ShieldCheck },
    { href: "/about",      label: "About 8th CPC",  icon: InfoIcon },
  ];

  const NavLinks = ({ onNav }: { onNav?: () => void }) => (
    <>
      {navItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <div
              onClick={onNav}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer select-none ${
                isActive
                  ? "bg-primary/15 text-primary font-semibold ring-1 ring-primary/30 shadow-[0_0_14px_rgba(139,92,246,0.18)]"
                  : "text-foreground/70 hover:text-foreground hover:bg-white/[0.06]"
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-foreground/45"}`} />
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col relative">

      {/* ── Animated Background ────────────────────────────────────────── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        <div className="bg-orb-violet" />
        <div className="bg-orb-cyan" />
        <div className="bg-orb-indigo" />
        <div className="dot-grid absolute inset-0 opacity-40" />
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-background/75 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group shrink-0">
              {/* SVG badge */}
              <div className="relative shrink-0">
                <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-105 transition-transform duration-200">
                  <defs>
                    <linearGradient id="lg1" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#a78bfa" />
                      <stop offset="0.55" stopColor="#8b5cf6" />
                      <stop offset="1" stopColor="#6366f1" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="1.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  <rect width="38" height="38" rx="10" fill="url(#lg1)" />
                  <rect width="38" height="38" rx="10" fill="url(#lg1)" opacity="0.3" />
                  <rect x="0.5" y="0.5" width="37" height="37" rx="9.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                  <text x="19" y="26.5" textAnchor="middle" fontFamily="Outfit, system-ui, sans-serif" fontWeight="800" fontSize="21" fill="white" filter="url(#glow)">8</text>
                </svg>
                {/* glow pulse */}
                <div className="absolute inset-0 rounded-[10px] bg-primary/25 blur-md -z-10 group-hover:bg-primary/40 transition-all duration-300" />
              </div>

              {/* Text mark */}
              <div className="flex flex-col leading-none">
                <div className="flex items-baseline gap-0.5">
                  <span className="font-extrabold text-[15px] tracking-tight text-foreground group-hover:text-white transition-colors duration-200">8 CPC</span>
                  <span className="font-bold text-[15px] tracking-tight text-primary ml-1">Calculate</span>
                </div>
                <span className="text-[9.5px] text-foreground/40 tracking-[0.06em] hidden sm:block mt-0.5">8cpccalculate.com</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            <NavLinks />
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-white/[0.06] text-foreground/70">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] flex flex-col gap-1 pt-12 bg-card border-border">
                <NavLinks onNav={() => setIsOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">

        {/* Disclaimer */}
        <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl border border-primary/15 bg-primary/[0.04] backdrop-blur-sm no-print">
          <InfoIcon className="h-4 w-4 shrink-0 mt-0.5 text-primary/60" />
          <p className="text-foreground/55 text-xs leading-relaxed">
            <span className="font-semibold text-foreground/75">Projected estimates only.</span>{" "}
            Official 8th CPC figures will be released upon submission of the commission's report (expected 2026–2027). Calculations are based on current proposals and 7th CPC patterns.
          </p>
        </div>

        {children}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-5 mt-auto no-print relative z-10">
        <div className="container mx-auto px-4 text-center text-xs text-foreground/30 space-y-0.5">
          <p><span className="font-semibold text-foreground/45">8cpcalculate.com</span> · For planning purposes only · Not affiliated with Govt. of India</p>
          <p>&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
