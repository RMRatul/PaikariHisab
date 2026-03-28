import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isDefaultPassword: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    isDefaultPassword: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    isDefaultPassword: boolean;
  }
}
