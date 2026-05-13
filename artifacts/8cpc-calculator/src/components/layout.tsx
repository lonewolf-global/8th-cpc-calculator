import { Link, useLocation } from "wouter";
import { Calculator, Table, CalendarClock, Info, Menu, Sparkles } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Calculator", icon: Calculator },
    { href: "/pay-matrix", label: "Pay Matrix", icon: Table },
    { href: "/arrears", label: "Arrears", icon: CalendarClock },
    { href: "/about", label: "About 8th CPC", icon: Info },
  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <div
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer select-none ${
                isActive
                  ? "bg-primary/15 text-primary font-medium ring-1 ring-primary/30"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background relative z-0">

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-purple-500/80" />
              <span className="relative font-bold font-serif text-white text-base leading-none">8</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-semibold text-sm tracking-tight text-foreground">CPC Calculator</span>
              <span className="text-[10px] text-muted-foreground tracking-wide">8th Pay Commission</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLinks />
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-white/5">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] flex flex-col gap-2 pt-12 bg-card border-border">
                <NavLinks />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">

        {/* Disclaimer */}
        <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-sm text-muted-foreground no-print">
          <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
          <p>
            <span className="font-semibold text-foreground">Projected estimates only.</span>{" "}
            Official 8th CPC figures will be released by the Government of India upon submission of the commission's report (expected 2026–2027). All calculations are based on current proposals and historical pay commission patterns.
          </p>
        </div>

        {children}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] bg-card/40 py-6 mt-auto no-print relative z-10">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground/70">8th Central Pay Commission Calculator</p>
          <p>For educational and planning purposes only · Not affiliated with the Government of India</p>
          <p>&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
