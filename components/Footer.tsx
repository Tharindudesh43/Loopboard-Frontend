import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-gradient-to-r from-primary/5 via-muted/40 to-status-doing/5 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <span className="font-heading bg-gradient-to-r from-primary to-status-doing bg-clip-text text-transparent font-medium">
          Task Board
        </span>
        <span>© {new Date().getFullYear()} Task Board. All rights reserved.</span>
        <nav className="flex items-center gap-4">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
