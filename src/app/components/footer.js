import Link from "next/link";
import AsciiPcb from "./ascii-pcb";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container-wide flex flex-col gap-2 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} zgro.net</p>
        <Link href="/cortado" className="hover:text-foreground hover:underline">
          Coffee
        </Link>
      </div>
      <AsciiPcb />
    </footer>
  );
}
