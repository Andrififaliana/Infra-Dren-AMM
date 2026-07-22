"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { School, Home, BarChart3, Info, Shield, Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const navLinks = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/etablissements", label: "Établissements", icon: School },
  { href: "/statistiques", label: "Statistiques", icon: BarChart3 },
  { href: "/a-propos", label: "À propos", icon: Info },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo_infra.jpg" alt="InfraDren AMM" className="h-8 w-auto" />
            <span className="text-lg font-bold text-foreground">InfraDren</span>
            <span className="hidden sm:inline text-sm text-muted-foreground">AMM</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Shield className="h-4 w-4" />
              Administration
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-muted-foreground hover:bg-accent transition-colors md:hidden"
              aria-label="Menu mobile"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute left-0 right-0 top-16 z-50 border-t bg-background md:hidden shadow-xl"
              >
                <nav className="space-y-0.5 p-3">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all",
                          isActive
                            ? "bg-primary/5 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          {link.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                      </Link>
                    );
                  })}
                  <Separator className="my-2" />
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm active:scale-[0.98] transition-transform"
                  >
                    <Shield className="h-4 w-4" />
                    Administration
                  </Link>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/logo_infra.jpg" alt="InfraDren AMM" className="h-8 w-auto" />
                <span className="font-bold text-foreground">InfraDren</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plateforme de gestion et de suivi des infrastructures scolaires de la région AMM.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Liens</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/etablissements" className="hover:text-primary transition-colors">Établissements</Link></li>
                <li><Link href="/statistiques" className="hover:text-primary transition-colors">Statistiques</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Administration</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>DREN AMM</li>
                <li>contact@dren-amm.mg</li>
                <li>+261 34 12 345 67</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <p className="text-center text-sm text-muted-foreground/60">
            &copy; {new Date().getFullYear()} InfraDren AMM. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
