export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container-wide flex flex-col gap-2 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} zaneg.net</p>
        <p>Built with Next.js.</p>
      </div>
    </footer>
  );
}
