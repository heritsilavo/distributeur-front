import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import SlideIn from "@/components/animations/SlideIn";
import ScaleIn from "@/components/animations/ScaleIn";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Distributeur 3D Admin
            </h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/login"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Accéder à l’espace Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Distributeur Automatique de <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Boissons 3D avec Paiement Intelligent 🍹
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Interface d’administration et simulation 3D moderne pour gérer boissons,
                paiements et caisses (liquide & virtuelle).
              </p>
              <div className="flex gap-4 justify-center">
                <ScaleIn delay={0.3}>
                  <Link
                    href="/login"
                    className="px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all transform hover:scale-105"
                  >
                    Accéder à l’Administration
                  </Link>
                </ScaleIn>
                <ScaleIn delay={0.4}>
                  <Link
                    href="/distributeur"
                    className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all transform hover:scale-105 border border-gray-200 dark:border-gray-700"
                  >
                    Acceder au distributeur 3D
                  </Link>
                </ScaleIn>
              </div>
            </div>
          </FadeIn>

          {/* --- Feature Cards --- */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <SlideIn direction="left" delay={0.2}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="text-4xl mb-4">🧃</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Gestion des Boissons
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ajoutez, modifiez ou supprimez des boissons avec leur prix et leur quantité disponible.
                </p>
              </div>
            </SlideIn>

            <SlideIn direction="bottom" delay={0.3}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Gestion des Caisses
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Visualisez les montants des caisses liquide et virtuelle. Suivez les transactions en temps réel.
                </p>
              </div>
            </SlideIn>

            <SlideIn direction="right" delay={0.4}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="text-4xl mb-4">👤</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Gestion des Utilisateurs
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Consultez les employés, suivez les soldes QR différés et gérez les prélèvements mensuels.
                </p>
              </div>
            </SlideIn>
          </div>

          {/* --- Section finale --- */}
          <FadeIn delay={0.6}>
            <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Administration du Distributeur 3D
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Simplifiez la gestion des stocks, caisses et paiements avec une interface intuitive.
              </p>
              <Link
                href="/login"
                className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all transform hover:scale-105"
              >
                Se connecter à l’espace Admin
              </Link>
            </div>
          </FadeIn>
        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© 2025 Distributeur 3D | Développé par Tsilavo et Fifaliana. Made in Madagascar.</p>
        </div>
      </footer>
    </div>
  );
}
