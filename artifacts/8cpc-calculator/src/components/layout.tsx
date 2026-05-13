import { Link, useLocation } from "wouter";
import { Calculator, Table, CalendarClock, Info, Menu } from "lucide-react";
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
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-secondary-foreground font-bold font-serif text-lg">
              8
            </div>
            <span className="font-bold text-lg tracking-tight text-primary">CPC Calculator</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <NavLinks />
          </nav>

          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] flex flex-col gap-4 pt-12">
                <NavLinks />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-200 flex items-start gap-3 no-print">
          <Info className="h-5 w-5 shrink-0 mt-0.5" />
          <p>
            <strong>Disclaimer:</strong> The figures shown in this calculator are projected estimates based on current proposals and historical patterns. Official 8th CPC figures will be released by the Government of India upon submission and acceptance of the commission's report (expected 2026-2027).
          </p>
        </div>
        
        {children}
      </main>

      <footer className="border-t bg-card py-8 mt-auto no-print">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>8th Central Pay Commission Calculator &copy; {new Date().getFullYear()}</p>
          <p className="mt-1">For educational and planning purposes only. Not affiliated with the Government of India.</p>
        </div>
      </footer>
    </div>
  );
}
