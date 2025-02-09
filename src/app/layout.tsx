import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ['100','200','300','400','500', '600','700','800','900',],
  subsets: ['latin'],
  display: 'swap',
 });

export const metadata: Metadata = {
  title: "Toolverse",
  description: "all in one tool platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} ${poppins.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
