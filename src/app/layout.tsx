import type { Metadata } from "next";
import { Outfit, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import ThemeProvider from "@/components/ui/ThemeProvider";
import { ToastProvider } from "@/hooks/useToast";
import "../styles/globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-condensed"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-nx-mono"
});

export const metadata: Metadata = {
  title: {
    default: "Nexus LifeOS",
    template: "%s · Nexus LifeOS"
  },
  description: "A premium Life Operating System for finance, habits, journal, productivity, and performance.",
  openGraph: {
    title: "Nexus LifeOS",
    description: "A premium Life Operating System for finance, habits, journal, productivity, and performance.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${outfit.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
        <ThemeProvider>
          <ToastProvider>
            <a className="nx-skip-link" href="#nx-main-content">
              Skip to content
            </a>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
