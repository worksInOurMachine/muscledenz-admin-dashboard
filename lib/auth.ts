import { strapi as api } from "./strapiSDK/strapi";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "OTP Login",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.phone || !credentials?.otp) return null;

          const res = await api.axios.post(`/otp/verify`, {
            phone: credentials.phone,
            otp: credentials.otp,
          });

          const data = res.data;

          console.log("OTP login response:", data);

          if (data?.jwt && data?.user) {
            return {
              id: String(data.user.id),
              phone: data.user.phone,
              jwt: data.jwt,
              type: data.user.type,
              name: `${data.user.firstname} ${data.user.lastname}`
            };
          }

          return null;
        } catch (err: any) {
          console.error("OTP login failed", err.response?.data?.error?.message || err.message);
          throw new Error(err.response?.data?.error?.message || "Login failed");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.jwt = (user as any).jwt;
        token.phone = (user as any).phone;
        token.type = (user as any).type;
        token.name = (user as any).name
      }
      return token;
    },
    async session({ session, token }:any) {
      session.user = {
        id: token.sub as string,
        phone: token.phone as string,
        type: token.type as string,
        name: token.name as string
      };
      session.jwt = token.jwt as string;
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET || 'sJKHDAGS56787E3DIU#$%^&*',
};
