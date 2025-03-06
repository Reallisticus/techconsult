import "~/styles/globals.css";

import { Silkscreen, Space_Grotesk } from "next/font/google";
import { type Metadata } from "next";
import { MotionConfig } from "framer-motion";

import { TRPCReactProvider } from "~/trpc/react";
import { cn } from "../lib/utils";
import { Footer } from "../components/layout/footer";
import { siteConfig } from "../lib/constants";
import { SmoothScroll } from "~/components/providers/scroll-provider";
import { Navbar } from "../components/layout/navbar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const silkscreen = Silkscreen({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-silkscreen",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${silkscreen.variable} overflow-x-hidden bg-neutral-950 font-sans text-white`}
      >
        <MotionConfig reducedMotion="user">
          <SmoothScroll>
            <Navbar />
            <main className="flex-1">
              <TRPCReactProvider>{children}</TRPCReactProvider>
            </main>
            <Footer />
          </SmoothScroll>
        </MotionConfig>
      </body>
    </html>
  );
}
