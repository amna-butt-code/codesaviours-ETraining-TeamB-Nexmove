import { Instrument_Serif, Figtree } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";

// Display face: used only for large headings.
const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

// Body face: friendly, open shapes, easy to read at 16px+.
const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Nexmove Physiotherapy Clinic",
  description: "Book physiotherapy appointments online at Nexmove Physiotherapy Clinic.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="nm-skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}