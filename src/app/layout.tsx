import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobForge — Track Your Job Search",
  description:
    "A sleek Kanban board for managing your job application pipeline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased text-slate-800 min-h-screen">
        {children}
      </body>
    </html>
  );
}
