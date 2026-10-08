import Footer from "../components/footer";
import Nav from "../components/nav";

const resumeUrl = "/zanegrosse_resume.pdf";

export const metadata = {
  title: "Resume | zgro.net",
  description: "Zane Grosse’s resume.",
  alternates: { canonical: "https://www.zgro.net/resume" },
};

export default function Resume() {
  return (
    <>
      <Nav />
      <main className="container-wide py-10 sm:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-medium">Resume</h1>
          <div className="flex flex-wrap gap-5 text-sm text-muted">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline"
            >
              Open PDF ↗
            </a>
            <a
              href={resumeUrl}
              download="zanegrosse_resume.pdf"
              className="hover:text-foreground hover:underline"
            >
              Download PDF
            </a>
          </div>
        </div>
        <object
          data={resumeUrl}
          type="application/pdf"
          aria-label="Zane Grosse’s resume PDF"
          className="mt-8 block h-[80dvh] min-h-[32rem] w-full border border-line bg-[var(--surface)]"
        >
          <p className="p-6 text-muted">
            <a href={resumeUrl} className="underline hover:text-foreground">
              Open the resume PDF
            </a>
            {" "}to view it in your browser.
          </p>
        </object>
      </main>
      <Footer />
    </>
  );
}
