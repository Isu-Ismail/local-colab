import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null; // Add the 'id' property here
      role?: string | null;
    } & DefaultSession["user"];
  }
  interface User {
    id?: string | null; // And here
    role?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string | null; // And here
    role?: string | null;
  }
}