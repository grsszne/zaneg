"use client";
import { useEffect } from "react";
import Nav from "../components/nav";
import { useRouter } from "next/navigation";

export default function n26pdr() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/posts/plans-for-jumping-robot-2025---2026");
    }, 1000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Nav />
      <main className="p-8 font-light text-xl text-center">
        Redirecting...
      </main>
    </>
  );
}
