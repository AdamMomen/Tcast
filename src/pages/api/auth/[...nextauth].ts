import NextAuth, { type NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

import { env } from "../../../env/server.mjs";

type Account = {
  provider?: string;
  accessToken?: string;
  refreshToken?: string;
};
console.log({ env });
export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt(token, user, account: Account = {}, profile, isNewUser: boolean) {
      if (!account.accessToken || !account.provider || !account.refreshToken) {
        console.log("account is missing preperties");
        return;
      }

      if (!token[account.provider]) {
        token[account.provider] = {};
      }

      token[account.provider].accessToken = account.accessToken;
      token[account.provider].refreshToken = account.refreshToken;

      return token;
    },
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  // Configure one or more authentication providers
  providers: [
    TwitterProvider({
      clientId: env.TWITTER_CLIENT_ID,
      clientSecret: env.TWITTER_CLIENT_SECRET,
      version: "2.0",
    }),
  ],
};

export default NextAuth(authOptions);
