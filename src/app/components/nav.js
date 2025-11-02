"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from 'next/navigation';
const useScreenWidth = () => {
  // Initialize width to 0 or a default value, and update it on the client side
  const [screenWidth, setScreenWidth] = useState(0); 

  useEffect(() => {
    // Check if window is defined (ensures this runs only on the client side)
    if (typeof window !== 'undefined') {
      // Set initial width
      setScreenWidth(window.innerWidth);

      // Function to update width on resize
      const handleResize = () => {
        setScreenWidth(window.innerWidth);
      };

      // Add event listener for window resize
      window.addEventListener('resize', handleResize);

      // Clean up the event listener on component unmount
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []); // Empty dependency array ensures this effect runs only once after initial render

  return screenWidth;
};
export default function Nav() {
  
  //var that stores screen width:
  let screenWidth = useScreenWidth();
  let additionalNavRoute = "";
  if (screenWidth > 990) {
    additionalNavRoute = usePathname().replace("/", " > ").replaceAll("-", " ");
  }
  if (additionalNavRoute == " > ") {
    additionalNavRoute = "";
  }



  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`tracking-tight sticky top-0 z-20 transition-all duration-300 backdrop-blur-sm ${
        scrolled
          ? "bg-white/80 dark:bg-background/70 shadow-sm"
          : "bg-white/50 dark:bg-background/50"
      }`}
    >
      <div className="flex items-center justify-between px-10 py-3 border-b">
        {/* Brand */}
        <a
          href="/"
          className="text-2xl font-normal text-2xl hover:text-orange-500 transition-colors"
        >
          zaneg.net {additionalNavRoute.replace("/", " > ")}
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex  space-x-8 text-2xl font-normal">
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
            <div className="flex ml-4 flex-col text-lg font-medium border-b">
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
