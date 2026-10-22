import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Nexmove Physiotherapy Clinic",
  description: "Book physiotherapy appointments online at Nexmove Physiotherapy Clinic.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
 <body className="min-h-full flex flex-col">
  <Header />
  <main className="flex-1">{children}</main>
  <Footer />
  <WhatsAppButton />
</body>
    </html>
  );
}
