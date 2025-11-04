"use client";
import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("@/components/pages/landing/Navbar"), {
  ssr: false,
});

const Banner = dynamic(() => import("@/components/pages/landing/Banner/Banner"), {
  ssr: false,
});

const Footer = dynamic(() => import("@/components/pages/landing/Footer/Footer"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Banner />
      </main>
      <Footer />
    </>
  );
}
