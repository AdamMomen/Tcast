import NextAuth, { type NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { env } from "../../../env/server.mjs";

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  theme: {
    colorScheme: 'light',
  },
  debug: true,
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async signIn() {
      return true;
    },
  },
  providers: [
    TwitterProvider({
      clientId: env.TWITTER_CLIENT_ID,
      clientSecret: env.TWITTER_CLIENT_SECRET,
      version: "2.0",
    }),
  ],
};

export default NextAuth(authOptions);
