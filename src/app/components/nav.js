"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-20 transition-all duration-300 backdrop-blur-lg ${
        scrolled
          ? "bg-white/80 dark:bg-background/70 shadow-sm"
          : "bg-white/50 dark:bg-background/50"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-3 border-b">
        {/* Brand */}
        <a
          href="/"
          className="text-2xl font-semibold hover:text-orange-500 transition-colors"
        >
          zaneg.net
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex  space-x-8 text-lg font-medium">
          <a href="/blog" className="hover:text-orange-500 transition-colors">
            Works
          </a>
          <a href="/about" className="hover:text-orange-500 transition-colors">
            About
          </a>
          <a href="/contact" className="hover:text-orange-500 transition-colors">
            Contact
          </a>
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 hover:bg-orange-500 dark:hover:bg-orange-500 transition"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Animated Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden "
          >
            <div className="flex  flex-col text-lg font-medium border-b">
              <a
                href="/blog"
                onClick={() => setOpen(false)}
                className="p-4 px-6 hover:text-orange-500 transition-colors"
              >
                Works
              </a>
              <a
                href="/about"
                onClick={() => setOpen(false)}
                className="p-4 px-6 hover:text-orange-500 transition-colors"
              >
                About
              </a>
              <a
                href="/contact"
                onClick={() => setOpen(false)}
                className="p-4 px-6 hover:text-orange-500 transition-colors"
              >
                Contact
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
