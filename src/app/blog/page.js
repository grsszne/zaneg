"use client";
import { useEffect } from "react";
import Nav from "../components/nav";
import { useRouter } from "next/navigation";

export default function Blog() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Nav />
      <main className="p-8 text-center">
        To be done... redirecting to home...
      </main>
    </>
  );
}
