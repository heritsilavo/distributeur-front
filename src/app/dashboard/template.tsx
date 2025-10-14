import LogoutButton from "@/components/auth/LogoutButton";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
    return <div className="min-h-screen flex flex-col items-center justify-center p-4">
        
        <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        Distributeur 3D Admin
                    </h1>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <LogoutButton></LogoutButton>
                    </div>
                </div>
            </div>
        </nav>

        <div >

        </div>
        
        <main className="pt-32 pb-20 px-4 w-full max-w-6xl mx-auto flex-grow relative">
            {children}
        </main>


    </div>;
}