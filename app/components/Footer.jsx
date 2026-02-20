import Link from "next/link";
import "./Footer.css"; // ou le chemin vers votre fichier CSS

export default function Footer() {
  return (
    <footer>
      <div>
        <div>
          <h3>MyShop</h3>
          <p>Votre boutique en ligne de confiance.</p>
        </div>

        <div>
          <h3>Informations</h3>
          <ul>
            <li><Link href="/mentions-legales">Mentions légales</Link></li>
            <li><Link href="/politique-confidentialite">Confidentialité</Link></li>
            <li><Link href="/cgu">CGU</Link></li>
            <li><Link href="/cgv">CGV</Link></li>
          </ul>
        </div>

        <div>
          <h3>Support</h3>
          <ul>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/a-propos">À propos</Link></li>
          </ul>
        </div>
      </div>

      <div>
        © {new Date().getFullYear()} MyShop. Tous droits réservés.
      </div>
    </footer>
  );
}