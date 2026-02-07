import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { 
  ClerkProvider
} from "@clerk/nextjs";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const outfitFont = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "PeerPath",
  description: "A platform to connect with peers and share knowledge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${outfitFont.className} antialiased`}
        >
          <Header isPro = {false}/>
          {children}
          <Footer/>
        </body>
      </html>
    </ClerkProvider>
  );
}
