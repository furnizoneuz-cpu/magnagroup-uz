import "./globals.css";
import { Inter, Montserrat } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], weight: ["600", "700", "800"], variable: "--font-montserrat", display: "swap" });

export const metadata = {
  title: "Magna Group — Mebel ishlab chiqarish",
  description:
    "Magna Group — ofis, tibbiyot, ta'lim va bolalar muassasalari uchun professional mebel ishlab chiqaruvchi. 160+ mahsulot.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="font-sans antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
