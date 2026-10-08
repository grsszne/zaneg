import Link from "next/link";
import Footer from "./components/footer";
import Nav from "./components/nav";
import PostTopics from "./components/post-topics";
import { getAllPosts } from "./lib/posts";

const title = "Zane Grosse | zgro.net";
const description = "Projects and notes by Zane Grosse on electronics, optical communication, FPGAs, and language models.";

export const metadata = {
  title,
  description,
  alternates: { canonical: "https://www.zgro.net/" },
  openGraph: {
    title,
    description,
    url: "https://www.zgro.net/",
    siteName: "zgro.net",
    type: "website",
  },
  twitter: { card: "summary", title, description },
};

export default function Home() {
  const posts = getAllPosts();

  return (
    <>
      <Nav />
      <main className="container-wide min-h-screen py-16 sm:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <section className="mb-16">
              <p className="mb-4 text-sm text-muted">Projects and notes</p>
              <h1 className="max-w-2xl text-4xl font-medium leading-tight sm:text-5xl">
                Zane Grosse
              </h1>
            </section>

            <section aria-label="Latest writing" className="grid grid-cols-1 items-start gap-x-8 gap-y-10 sm:grid-cols-2 lg:block lg:border-t border-line">
              {posts.map((post) => (
                <article key={post.slug} className="min-w-0 border-t border-line lg:border-t-0 lg:border-b">
                  <Link href={post.url} className="group block py-6 lg:py-8">
                    <div className="mb-3 flex flex-col gap-1 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
                      <time>{post.date}</time>
                    </div>
                    <h2 className="text-2xl font-medium leading-snug group-hover:underline">
                      {post.title}
                    </h2>
                    <p className="mt-3 max-w-2xl leading-7 text-muted">
                      {post.description}
                    </p>
                    <PostTopics topics={post.topics} />
                  </Link>
                  {post.url === "/laser" && (
                    <LaserPhoto className="pb-2 lg:hidden" />
                  )}
                </article>
              ))}
            </section>
          </div>

          <LaserPhoto className="hidden min-w-0 lg:block" />
        </div>
      </main>
      <Footer />
    </>
  );
}

function LaserPhoto({ className }) {
  return (
    <figure className={className}>
      <Link
        href="/laser"
        className="block focus-visible:outline-2 focus-visible:outline-offset-4"
        aria-label="Read about the laser project and STM32 programming"
      >
        <img
          src="/images/laser/bring-up/stm32-first-program-1080.webp"
          srcSet="/images/laser/bring-up/stm32-first-program-1080.webp 1080w, /images/laser/bring-up/stm32-first-program-2160.webp 2160w"
          sizes="(min-width: 1072px) 488px, (min-width: 1024px) calc((100vw - 96px) / 2), (min-width: 640px) calc((100vw - 64px) / 2), calc(100vw - 32px)"
          width="1080"
          height="1440"
          fetchPriority="high"
          decoding="async"
          alt="An STM32F723 board being programmed beside a laptop, with programming leads and a USB-C cable connected, illuminated by warm sunlight."
          className="block h-auto w-full"
        />
      </Link>
      <figcaption className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm text-muted">
        <Link href="/laser" className="hover:underline">STM32F723 / Laser project ↗</Link>
        <span>Beautiful!</span>
      </figcaption>
    </figure>
  );
}
