import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TDC Matchmaker CRM & AI Matchmaking Engine",
  description: "Internal CRM-style dashboard used by professional matchmakers to manage clients, track journey status, and generate intelligent compatibility recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-primary/20">
        {children}
      </body>
    </html>
  );
}

