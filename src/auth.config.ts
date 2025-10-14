import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validations/auth";

export default {
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { username, password } = validatedFields.data;

        // TODO: Remplacer par une vraie vérification en base de données
        if (username === "tsilavo" && password === "123456") {
          return {
            id: "1",
            name: "Tsilavo",
            email: "tsilavo@example.com",
            username: "tsilavo",
          };
        }

        return null;
      },
    }),
  ],
  trustHost: true,
} satisfies NextAuthConfig;