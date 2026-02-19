import { Link } from "wouter";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <p className="text-sm font-semibold text-foreground">Chosen Connect</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/join" className="hover:text-foreground transition-colors">Join</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Chosen Connect is a for-profit community platform. Profits will be spent to build God's kingdom!</p>
          <p>Content is shared for fellowship and encouragement, not as professional or pastoral advice.</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} Chosen Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
