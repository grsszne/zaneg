import Footer from "@/app/components/footer";
import Nav from "@/app/components/nav";
import LaserArchitecture from "@/app/components/laser-architecture";
import PcbSection from "@/app/components/pcb-section";
import MechanicalViewer from "@/app/components/mechanical-viewer";
import DocumentationChecklist from "@/app/components/documentation-checklist";
import PostTopics from "@/app/components/post-topics";
import UsbEchoBenchmark from "@/app/components/usb-echo-benchmark";

export default function PostArticle({ post }) {
  const hasPcbSections = post.blocks.some(block => block.type === "pcb");

  return (
    <>
      <Nav />
      <main className={`${hasPcbSections ? "container-wide" : "container-page"} min-h-screen py-16 sm:py-20`}>
        <article>
          <header className="border-b border-line pb-10">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
              <p>{post.date}</p>
              {post.status && <p>{post.status}</p>}
            </div>
            <h1 className="mt-4 text-4xl font-medium leading-tight sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted">
              {post.description}
            </p>
            <PostTopics topics={post.topics} />
          </header>

          {post.visual === "laser-architecture" && <LaserArchitecture />}

          {post.headings.length > 0 && (
            <nav
              aria-label="Sections"
              className="my-8 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted"
            >
              {post.headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className="hover:text-foreground hover:underline"
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          )}

          <div className="grid grid-cols-1 gap-9">
            {post.blocks.map((block, index) => block.type === "pcb" ? (
              <PcbSection key={`${block.model}-${index}`} model={block.model} html={block.html} />
            ) : block.type === "mechanical" ? (
              <section key={`${block.model}-${index}`} aria-label="Interactive mechanical assembly">
                <div className="markdown-post mb-6" dangerouslySetInnerHTML={{ __html: block.html }} />
                <MechanicalViewer model={block.model} label="Laser sled" />
              </section>
            ) : block.type === "checklist" ? (
              <DocumentationChecklist key={block.id} stages={block.stages} />
            ) : block.type === "benchmark" && block.model === "usb-echo" ? (
              <UsbEchoBenchmark key={`usb-echo-${index}`} />
            ) : (
              <div key={index} className="markdown-post" dangerouslySetInnerHTML={{ __html: block.html }} />
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
