import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // In a real app, you'd validate against your database
        // For demo purposes, we'll use hardcoded users
        const users = [
          {
            id: "1",
            email: "admin@gym.com",
            password: "admin123",
            name: "Admin User",
            role: "admin",
          },
          {
            id: "2",
            email: "staff@gym.com",
            password: "staff123",
            name: "Staff User",
            role: "staff",
          },
        ]

        const user = users.find((u) => u.email === credentials?.email && u.password === credentials?.password)

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  ...(process.env.NEXTAUTH_URL && {
    url: process.env.NEXTAUTH_URL,
  }),
}
