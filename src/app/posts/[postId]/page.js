import { notFound } from "next/navigation";
import Footer from "@/app/components/footer";
import Nav from "@/app/components/nav";
import { getAllPosts, getPostBySlug } from "@/app/lib/posts";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    postId: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { postId } = await params;
  const post = getPostBySlug(postId);

  if (!post) {
    return {
      title: "Post not found | zaneg.net",
    };
  }

  return {
    title: `${post.title} | zaneg.net`,
    description: post.description,
  };
}

export default async function PostPage({ params }) {
  const { postId } = await params;
  const post = getPostBySlug(postId);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Nav />
      <main className="container-page min-h-screen py-16 sm:py-20">
        <article>
          <header className="border-b border-line pb-10">
            <p className="text-sm text-muted">{post.date}</p>
            <h1 className="mt-4 text-4xl font-medium leading-tight sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted">
              {post.description}
            </p>
          </header>

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

          <div
            className="markdown-post"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}
