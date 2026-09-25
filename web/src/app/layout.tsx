import type { Metadata, Viewport } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

const DESCRIPCION =
  "A no-loss lottery on Stellar. You put money into a pool, the pool earns on Blend, and every week one saver wins everyone's yield. Your capital stays intact.";

export const metadata: Metadata = {
  title: "Zorrito",
  description: DESCRIPCION,
  metadataBase: new URL("https://stellar.zorrito.app"),
  openGraph: {
    title: "Zorrito — Save. Nobody loses. One wins the yield.",
    description: DESCRIPCION,
    images: [{ url: "/assets/zorritoimage.png", width: 1200, height: 646 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zorrito",
    description: DESCRIPCION,
    images: ["/assets/zorritoimage.png"],
  },
};

// Mobile-first: se entra desde el teléfono, desde el link que circula en el
// grupo. `viewport-fit` deja respirar el notch.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fd840e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${baloo.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
