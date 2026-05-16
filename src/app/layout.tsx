import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import ThemeProvider from "@/components/ui/ThemeProvider";
import { ToastProvider } from "@/hooks/useToast";
import "../styles/globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow"
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow-condensed"
});

export const metadata: Metadata = {
  title: "Nexus LifeOS Dashboard",
  description: "Template-faithful modular LifeOS SaaS dashboard"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${barlow.variable} ${barlowCondensed.variable}`}>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
