import { notFound } from "next/navigation";
import PostArticle from "@/app/components/post-article";
import { getAllPosts, getPostBySlug } from "@/app/lib/posts";

export function generateStaticParams() {
  return getAllPosts().filter(post => post.url.startsWith("/posts/")).map((post) => ({
    postId: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { postId } = await params;
  const post = getPostBySlug(postId);

  if (!post) {
    return {
      title: "Post not found | zgro.net",
    };
  }

  return {
    title: `${post.title} | zgro.net`,
    description: post.description,
  };
}

export default async function PostPage({ params }) {
  const { postId } = await params;
  const post = getPostBySlug(postId);

  if (!post) {
    notFound();
  }

  return <PostArticle post={post} />;
}
