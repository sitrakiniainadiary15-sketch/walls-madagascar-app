import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-6 text-sm">

        <div>
          <h3 className="font-semibold mb-2">MyShop</h3>
          <p>Votre boutique en ligne de confiance.</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Informations</h3>
          <ul className="space-y-1">
            <li><Link href="/mentions-legales">Mentions légales</Link></li>
            <li><Link href="/politique-confidentialite">Confidentialité</Link></li>
            <li><Link href="/cgu">CGU</Link></li>
            <li><Link href="/cgv">CGV</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Support</h3>
          <ul className="space-y-1">
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/a-propos">À propos</Link></li>
          </ul>
        </div>

      </div>

      <div className="text-center text-xs opacity-60 pb-4">
        © {new Date().getFullYear()} MyShop
      </div>
    </footer>
  );
}
