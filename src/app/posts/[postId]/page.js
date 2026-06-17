import Image from "next/image";
import Footer from "@/app/components/footer";
import items from "@/app/components/items";
import Nav from "@/app/components/nav";

export async function generateMetadata({ params }) {
  const { postId } = await params;
  const post = items.find((item) => item.postId === postId);

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
  const post = items.find((item) => item.postId === postId);

  if (!post) {
    return (
      <>
        <Nav />
        <main className="container-page min-h-screen py-16">
          <h1 className="text-3xl font-medium">Post not found</h1>
        </main>
        <Footer />
      </>
    );
  }

  const headers = post.content.filter(
    (item) => item.contentType === "text" && item.header
  );

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

          {headers.length > 0 && (
            <nav
              aria-label="Sections"
              className="my-8 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted"
            >
              {headers.map((item) => (
                <a
                  key={item.header}
                  href={`#${slugify(item.header)}`}
                  className="hover:text-foreground hover:underline"
                >
                  {item.header}
                </a>
              ))}
            </nav>
          )}

          <div className="space-y-9">
            {post.content.map((contentItem, index) => (
              <section key={index}>
                {contentItem.contentType === "text" && (
                  <>
                    {contentItem.header && (
                      <h2
                        id={slugify(contentItem.header)}
                        className="scroll-mt-24 text-2xl font-medium"
                      >
                        {contentItem.header}
                      </h2>
                    )}
                    <p
                      className="mt-4 text-lg leading-8 text-foreground/90"
                      dangerouslySetInnerHTML={{
                        __html: linkify(contentItem.content),
                      }}
                    />
                  </>
                )}

                {contentItem.contentType === "image" && (
                  <figure>
                    <Image
                      src={contentItem.source}
                      alt={contentItem.alt || contentItem.caption || post.title}
                      className="h-auto w-full border border-line bg-white"
                      width={1200}
                      height={800}
                      sizes="(max-width: 800px) 100vw, 760px"
                    />
                    {contentItem.caption && (
                      <figcaption className="mt-3 text-sm leading-6 text-muted">
                        {contentItem.caption}
                      </figcaption>
                    )}
                  </figure>
                )}
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

function slugify(value) {
  return value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

function linkify(value) {
  return value.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline">$1</a>'
  );
}
