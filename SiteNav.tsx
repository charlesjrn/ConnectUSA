import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface SiteNavProps {
  /** Extra nav links to show before the CTA */
  links?: { href: string; label: string }[];
}

export default function SiteNav({ links }: SiteNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          Chosen Connect
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-5">
          {links?.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/founding-circle">
            <Button size="sm" className="rounded-full">Founding Circle</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-border/50 bg-white px-4 py-4 space-y-3">
          {links?.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/founding-circle" onClick={() => setMobileOpen(false)}>
            <Button size="sm" className="rounded-full w-full">Founding Circle</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
