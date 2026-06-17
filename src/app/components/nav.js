import Link from "next/link";

const links = [
  { href: "/", label: "Writing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  return (
    <header className="border-b border-line bg-background/90 sticky top-0 z-20 backdrop-blur">
      <nav className="container-wide flex min-h-14 items-center justify-between gap-6 py-3">
        <Link href="/" className="text-sm font-medium tracking-normal">
          zaneg.net
        </Link>
        <div className="flex items-center gap-5 text-sm text-muted">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
