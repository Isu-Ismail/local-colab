import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }     
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('Invalid credentials');
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordMatch) {
          throw new Error('Invalid credentials');
        }

        // 1. CRITICAL CHANGE: Include the user's role here
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  
  // 2. CRITICAL ADDITION: Add the callbacks section
  callbacks: {
    // This is called when a JWT is created (i.e., on sign in).
    async jwt({ token, user }) {
      // The user object is only available on the first call.
      // We are adding the 'role' from the user object to the token.
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    // This is called whenever a session is accessed.
    async session({ session, token }) {
      // We are adding the 'role' from the token to the session object.
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/', // Assuming your login page is at the root
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };