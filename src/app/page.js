import Link from "next/link";
import Footer from "./components/footer";
import Items from "./components/items";
import Nav from "./components/nav";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="container-page min-h-screen py-16 sm:py-24">
        <section className="mb-16">
          <p className="mb-4 text-sm text-muted">Projects and notes</p>
          <h1 className="max-w-2xl text-4xl font-medium leading-tight sm:text-5xl">
            Zane G.
          </h1>
        </section>

        <section aria-label="Latest writing" className="border-t border-line">
          {Items.map((item) => (
            <article key={item.postId} className="border-b border-line py-8">
              <Link href={`/posts/${item.postId}`} className="group block">
                <div className="mb-3 flex flex-col gap-1 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
                  <time>{item.date}</time>
                  <span>{item.content.length} sections</span>
                </div>
                <h2 className="text-2xl font-medium leading-snug group-hover:underline">
                  {item.title}
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-muted">
                  {item.description}
                </p>
              </Link>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
