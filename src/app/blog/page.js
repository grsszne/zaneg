import Link from "next/link";
import Footer from "../components/footer";
import Nav from "../components/nav";
import { getAllPosts } from "../lib/posts";

export const metadata = {
  title: "Writing | zaneg.net",
};

export default function Blog() {
  const posts = getAllPosts();

  return (
    <>
      <Nav />
      <main className="container-page min-h-screen py-16">
        <h1 className="text-3xl font-medium">Writing</h1>
        <div className="mt-10 border-t border-line">
          {posts.map((post) => (
            <article key={post.slug} className="border-b border-line py-6">
              <Link href={`/posts/${post.slug}`} className="group block">
                <time className="text-sm text-muted">{post.date}</time>
                <h2 className="mt-2 text-xl font-medium group-hover:underline">
                  {post.title}
                </h2>
                <p className="mt-2 leading-7 text-muted">{post.description}</p>
              </Link>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
