import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Providers from "./components/Providers";

export const metadata = {
  title: "MyShop",
  description: "Boutique en ligne",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
