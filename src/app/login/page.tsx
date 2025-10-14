"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import FadeIn from "@/components/animations/FadeIn";
import ScaleIn from "@/components/animations/ScaleIn";
import Link from "next/link";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                username: data.username,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                setError("Identifiants incorrects");
                setIsLoading(false);
                return;
            }

            router.push(callbackUrl);
            router.refresh();
        } catch {
            setError("Une erreur est survenue");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
            <FadeIn>
                <ScaleIn delay={0.2}>
                    <div className="w-full max-w-md">
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    Bienvenue 👋
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Connectez-vous à votre compte
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nom d'utilisateur
                                    </label>
                                    <input
                                        {...register("username")}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="tsilavo"
                                    />
                                    {errors.username && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.username.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Mot de passe
                                    </label>
                                    <input
                                        {...register("password")}
                                        type="password"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="••••••"
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Connexion..." : "Se connecter"}
                                </button>

                                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                    Pas encore de compte ?{" "}
                                    <Link
                                        href="/register"
                                        className="text-primary hover:underline font-medium"
                                    >
                                        S'inscrire
                                    </Link>
                                </p>
                            </form>

                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                    Test: tsilavo / 123456
                                </p>
                            </div>
                        </div>
                    </div>
                </ScaleIn>
            </FadeIn>
        </div>
    );
}