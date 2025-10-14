import { z } from "zod";

export const loginSchema = z.object({
    username: z
        .string()
        .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
        .max(20, "Maximum 20 caractères"),
    password: z
        .string()
        .min(6, "Le mot de passe doit contenir au moins 6 caractères")
        .max(100, "Maximum 100 caractères"),
});

export const registerSchema = z
    .object({
        username: z.string().min(3, "Minimum 3 caractères").max(20),
        email: z.string().email("Email invalide"),
        password: z.string().min(6, "Minimum 6 caractères"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
    });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;