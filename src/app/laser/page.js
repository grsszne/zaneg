import PostArticle from "@/app/components/post-article";
import { getPostBySlug } from "@/app/lib/posts";

const slug = "laser-sending-data-through-light";

export function generateMetadata() {
  const post = getPostBySlug(slug);
  return {
    title: `${post.title} | zgro.net`,
    description: post.description,
    alternates: { canonical: "https://www.zgro.net/laser" },
  };
}

export default function LaserPage() {
  return <PostArticle post={getPostBySlug(slug)} />;
}
