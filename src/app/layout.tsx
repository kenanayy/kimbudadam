import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kimbuadam.netlify.app"),
  title: "Kim Bu Adam? - Futbolcu Tahmin Oyunu",
  description: "Transfer ve kariyer geçmişinden futbolcuyu bulma oyunu. Günün futbolcusunu çöz, futbol bilgini test et!",
  applicationName: "Kim Bu Adam?",
  icons: {
    icon: [
      { url: "/icon.svg?v=6", type: "image/svg+xml" },
      { url: "/favicon-32x32.png?v=6", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png?v=6", type: "image/png", sizes: "16x16" },
      { url: "/favicon.ico?v=6", sizes: "any" },
    ],
    apple: "/logo.png?v=6",
  },
  openGraph: {
    title: "Kim Bu Adam? - Futbolcu Tahmin Oyunu",
    description: "Transfer ve kariyer geçmişinden futbolcuyu bulma oyunu. Günün futbolcusunu çöz, futbol bilgini test et!",
    url: "https://kimbuadam.netlify.app",
    siteName: "Kim Bu Adam?",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kim Bu Adam? - Futbolcu Tahmin Oyunu",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kim Bu Adam? - Futbolcu Tahmin Oyunu",
    description: "Transfer ve kariyer geçmişinden futbolcuyu bulma oyunu. Günün futbolcusunu çöz, futbol bilgini test et!",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#14532d" },
    { media: "(prefers-color-scheme: dark)", color: "#071f12" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${jakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("football_guess_theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
