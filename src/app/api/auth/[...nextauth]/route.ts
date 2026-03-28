import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(db as any),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await db.user.findFirst({
          where: {
            OR: [
              { username: credentials.username },
              { email: credentials.username }
            ]
          },
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email || user.username,
          role: user.role,
          isDefaultPassword: user.isDefaultPassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.isDefaultPassword = user.isDefaultPassword;
        token.email = user.email;
      }
      if (trigger === "update" && session?.email) {
        token.email = session.email;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.isDefaultPassword = token.isDefaultPassword;
        session.user.email = token.email;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
