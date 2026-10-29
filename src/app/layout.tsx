import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { VenomProvider } from "@/components/VenomProvider";
import { SymbioteSpores } from "@/components/SymbioteSpores";
import { SymbioteInfectionVeins } from "@/components/SymbioteInfectionVeins";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CMHS PRC — Cyberpunk Robotics & Code Lab | Room 312",
  description:
    "Official website, batch portal, and robotics laboratory platform of Cumilla Modern High School Programming And Robotics Club.",
  icons: {
    icon: "/assets/brand/cmhs-prc-profile.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} dark antialiased`}>
      <body className="min-h-screen flex flex-col bg-[#04080D] text-[#F5E8C7] selection:bg-[#E62229] selection:text-white font-mono overflow-x-clip">
        <SmoothScroll>
          <VenomProvider>
            {/* Top Cyberpunk Progress Bar */}
            <ScrollProgressBar />
            {/* Ambient Symbiote Spores & Infection Veins */}
            <SymbioteSpores />
            <SymbioteInfectionVeins />
            <Navbar />
            <main className="flex-1 relative z-10 px-3 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1440px] mx-auto w-full">
              {children}
            </main>
            <Footer />
          </VenomProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
