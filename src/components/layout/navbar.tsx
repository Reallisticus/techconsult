// src/components/layout/navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { cn } from "../../lib/utils";
import { Magnetic } from "../ui/magnetic";

export const Navbar = () => {
  const [active, setActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Case Studies", href: "/case-studies" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  useMotionValueEvent(scrollY, "change", (latest) => {
    setActive(latest > 50);
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <header>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed left-0 right-0 top-0 z-50 px-6 py-4 transition-all duration-300",
          active ? "bg-black/10 backdrop-blur-md" : "",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <h1 className="from-primary-600 to-secondary-500 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
              TechConsult.BG
            </h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center space-x-8 md:flex">
            {navItems.map((item) => (
              <Magnetic key={item.name} strength={15}>
                <Link
                  href={item.href}
                  className="relative text-white transition-colors hover:text-white/80"
                >
                  <span className="relative z-10">{item.name}</span>
                  <span className="bg-accent-500 absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </Magnetic>
            ))}
            <Magnetic strength={30}>
              <button className="from-accent-600 to-accent-400 rounded-full bg-gradient-to-r px-6 py-2 font-medium text-white transition-all duration-300 hover:shadow-lg">
                Let's Talk
              </button>
            </Magnetic>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative z-50 flex h-10 w-10 items-center justify-center"
            >
              <div className="burger-menu relative h-6 w-6">
                <motion.span
                  animate={{
                    rotate: isOpen ? 45 : 0,
                    y: isOpen ? 8 : 0,
                  }}
                  className="absolute left-0 top-0 h-0.5 w-full bg-white"
                ></motion.span>
                <motion.span
                  animate={{ opacity: isOpen ? 0 : 1 }}
                  className="absolute left-0 top-[10px] h-0.5 w-full bg-white"
                ></motion.span>
                <motion.span
                  animate={{
                    rotate: isOpen ? -45 : 0,
                    y: isOpen ? -8 : 0,
                  }}
                  className="absolute bottom-0 left-0 h-0.5 w-full bg-white"
                ></motion.span>
              </div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={{ opacity: 0, x: "100%" }}
        animate={{
          opacity: isOpen ? 1 : 0,
          x: isOpen ? 0 : "100%",
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="from-primary-900 to-primary-800 fixed inset-0 z-40 flex flex-col justify-center bg-gradient-to-b"
      >
        <div className="container px-8">
          <div className="flex flex-col space-y-6 text-white">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isOpen ? 1 : 0,
                  y: isOpen ? 0 : 20,
                }}
                transition={{
                  delay: isOpen ? index * 0.1 : 0,
                  duration: 0.5,
                }}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="hover:text-accent-400 text-3xl font-medium transition-colors"
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isOpen ? 1 : 0,
                y: isOpen ? 0 : 20,
              }}
              transition={{
                delay: isOpen ? navItems.length * 0.1 : 0,
                duration: 0.5,
              }}
            >
              <button className="bg-accent-500 mt-6 rounded-full px-8 py-3 text-lg font-medium text-white">
                Let's Talk
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </header>
  );
};
