"use client";

import LogoutButton from "@/components/auth/LogoutButton";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface DashboardTemplateProps {
    children: React.ReactNode;
}

// Composant pour les boutons de la sidebar
interface SidebarButtonProps {
    icon: string;
    label: string;
    isActive?: boolean;
    onClick: () => void;
}

const SidebarButton = ({ icon, label, isActive = false, onClick }: SidebarButtonProps) => (
    <button
        onClick={onClick}
        className={`cursor-pointer w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            }`}
    >
        <span className="text-lg">{icon}</span>
        <span className="font-medium whitespace-nowrap">{label}</span>
    </button>
);

export default function DashboardTemplate({ children }: DashboardTemplateProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Exemple de boutons - à adapter selon vos besoins
    const menuButtons = [
        { id: "dashboard", url:"/dashboard", icon: "📊", label: "Tableau de bord" },
        { id: "boissons", url:"/dashboard/boissons", icon: "🧃", label: "Gérer les boissons" },
        { id: "caisse", url:"/dashboard/caisse", icon: "📦", label: "Caisse" },
        { id: "historique", url:"/dashboard/historique", icon: "⚙️", label: "Historique d'achat" },
    ];

    const handleButtonClick = (buttonId: string) => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
        router.push(menuButtons.find(btn => btn.id === buttonId)?.url || "/dashboard");
    };

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Overlay pour mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                {/* En-tête sidebar */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Menu Admin
                    </h2>
                    {/* Bouton fermer pour mobile */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <span className="text-xl">✕</span>
                    </button>
                </div>

                {/* Boutons de navigation - Partie principale */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuButtons.map((button) => (
                        <SidebarButton
                            key={button.id}
                            icon={button.icon}
                            label={button.label}
                            isActive={pathname === button.url}
                            onClick={() => handleButtonClick(button.id)}
                        />
                    ))}
                </nav>

                {/* Boutons Theme et Déconnexion - En bas sur mobile seulement */}
                <div className="lg:hidden p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="flex justify-center">
                        <ThemeToggle />
                    </div>
                    <LogoutButton />
                </div>
            </aside>

            {/* Contenu principal */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Navigation top */}
                <nav className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 z-40 supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-800/60">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        {/* Bouton menu mobile */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                        >
                            <span className="text-xl">☰</span>
                        </button>

                        {/* Titre centré sur mobile, à gauche sur desktop */}
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white lg:flex-1 text-center lg:text-left">
                            Distributeur 3D Admin
                        </h1>

                        {/* Actions utilisateur - Cachées sur mobile (déplacées dans sidebar) */}
                        <div className="hidden lg:flex items-center gap-4">
                            <ThemeToggle />
                            <LogoutButton />
                        </div>
                    </div>
                </nav>

                {/* Contenu */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto relative">
                    {children}
                </main>
            </div>
        </div>
    );
}