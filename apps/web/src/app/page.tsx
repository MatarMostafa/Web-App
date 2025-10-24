import Banner from "@/components/pages/landing/Banner";
import Footer from "@/components/pages/landing/Footer/Footer";
import Navbar from "@/components/pages/landing/Navbar";
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
