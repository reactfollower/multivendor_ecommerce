import type { Metadata } from "next";
import { Inter, Barlow } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "next-themes";

import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from "@clerk/nextjs"

// Toast
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import ModalProvider from "@/providers/modal-provider";

// Fonts
const interFont = Inter({ subsets: ["latin"]});
const barlowFont = Barlow({subsets:['latin'],
  weight:['500','700'],
  variable: "--font-barlow"
});

export const metadata: Metadata = {
  title: "GoShop",
  description: "Welcome to GoShop, your ultimate destination for seamless online shopping! Discover a vast a array of products from trusted sellers, all in one convenient marketplace. With GoShop, shopping is made easy, fast, and enjoyable. Find everything you need, from fashion and electronics to home essentials, and experience the joy of hassle-free online shopping. Start exploring today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body
        className={`{interFont.className} ${barlowFont.variable}`} >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
            >
        <ModalProvider>{children}</ModalProvider>
        <Toaster/>
        <SonnerToaster position="bottom-left" />
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
