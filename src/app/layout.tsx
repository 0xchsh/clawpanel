import type { Metadata } from "next";
import { Agentation } from "agentation";
import "./globals.css";
import { PageShell } from "@/components/page-shell";

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
    <html lang="en">
      <body className="antialiased">
        <PageShell>{children}</PageShell>
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
