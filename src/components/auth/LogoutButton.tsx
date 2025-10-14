"use client";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

export default function LogoutButton() {
  const theme = useTheme();
  console.log("Current theme:", theme.theme);
  
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
    >
      Déconnexion
    </button>
  );
}