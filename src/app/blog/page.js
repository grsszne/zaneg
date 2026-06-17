import Link from "next/link";
import Footer from "../components/footer";
import Items from "../components/items";
import Nav from "../components/nav";

export const metadata = {
  title: "Writing | zaneg.net",
};

export default function Blog() {
  return (
    <>
      <Nav />
      <main className="container-page min-h-screen py-16">
        <h1 className="text-3xl font-medium">Writing</h1>
        <div className="mt-10 border-t border-line">
          {Items.map((item) => (
            <article key={item.postId} className="border-b border-line py-6">
              <Link href={`/posts/${item.postId}`} className="group block">
                <time className="text-sm text-muted">{item.date}</time>
                <h2 className="mt-2 text-xl font-medium group-hover:underline">
                  {item.title}
                </h2>
                <p className="mt-2 leading-7 text-muted">{item.description}</p>
              </Link>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
