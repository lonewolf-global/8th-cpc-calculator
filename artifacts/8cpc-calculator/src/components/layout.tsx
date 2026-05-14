import { Link, useLocation } from "wouter";
import { Calculator, Table, CalendarClock, Info as InfoIcon, Menu, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/",           label: "Calculator",  icon: Calculator },
    { href: "/pay-matrix", label: "Pay Matrix",  icon: Table },
    { href: "/arrears",    label: "Arrears",     icon: CalendarClock },
    { href: "/pension",    label: "Pension",     icon: ShieldCheck },
    { href: "/about",      label: "About 8th CPC", icon: InfoIcon },
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
                  ? "bg-primary/15 text-primary font-semibold ring-1 ring-primary/30 shadow-[0_0_12px_rgba(139,92,246,0.15)]"
                  : "text-foreground/70 hover:text-foreground hover:bg-white/[0.06]"
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-foreground/50"}`} />
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background relative z-0">

      {/* ── Navigation ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-indigo-600 group-hover:from-violet-400 group-hover:to-indigo-500 transition-all duration-300" />
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_60%)]" />
                <span className="relative font-bold text-white text-base leading-none font-serif">8</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
                  8cpcalculate
                </span>
                <span className="text-[10px] text-foreground/40 tracking-wide hidden sm:block">
                  8th Pay Commission
                </span>
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

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">

        {/* Disclaimer */}
        <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl border border-primary/15 bg-primary/[0.04] text-sm no-print">
          <InfoIcon className="h-4 w-4 shrink-0 mt-0.5 text-primary/70" />
          <p className="text-foreground/60 text-xs leading-relaxed">
            <span className="font-semibold text-foreground/80">Projected estimates only.</span>{" "}
            Official 8th CPC figures will be released upon submission of the commission's report (expected 2026–2027). Calculations are based on current proposals and 7th CPC patterns.
          </p>
        </div>

        {children}
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-5 mt-auto no-print relative z-10">
        <div className="container mx-auto px-4 text-center text-xs text-foreground/35 space-y-0.5">
          <p><span className="font-medium text-foreground/50">8cpcalculate.com</span> · For planning purposes only · Not affiliated with Govt. of India</p>
          <p>&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

