import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extends the built-in session to include the 'role' property.
   */
  interface Session {
    user: {
      role?: string | null;
    } & DefaultSession["user"];
  }

  /**
   * Extends the built-in user to include the 'role' property.
   */
  interface User {
    role?: string | null;
  }
}

declare module "next-auth/jwt" {
  /** Extends the built-in JWT to include the 'role' property. */
  interface JWT {
    role?: string | null;
  }
}