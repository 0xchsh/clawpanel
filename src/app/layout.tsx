import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Agentation } from "agentation";
import "./globals.css";
import { PageShell } from "@/components/page-shell";
import { ThemeProvider } from "@/components/theme-provider";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClawPanel",
  description: "A better dashboard for OpenClaw",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
      <body className="antialiased">
        <ThemeProvider>
          <PageShell>{children}</PageShell>
        </ThemeProvider>
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
