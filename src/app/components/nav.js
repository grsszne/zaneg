import Link from "next/link";

const links = [
  { href: "/", label: "Writing" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
  { href: "/cortado", label: "Cortado" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-background/90 backdrop-blur">
      <nav className="container-wide flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 sm:gap-x-6">
        <Link href="/" className="text-sm font-medium tracking-normal">
          zgro.net
        </Link>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-3 text-sm text-muted sm:gap-5">
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
