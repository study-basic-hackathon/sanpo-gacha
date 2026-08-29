import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/backend/lib/db/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 60,
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.email = token.email;
        session.user.id = token.userId;
        session.user.name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
