import NextAuth, { type NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { env } from "../../../env/server.mjs";

export const authOptions: NextAuthOptions = {
    secret: env.NEXTAUTH_SECRET,
    theme: {
        colorScheme: 'dark',
    },
    debug: true,
    callbacks: {
        async jwt({ token, account }) {
            if (account && account.oauth_token && account.oauth_token_secret) {
                token.userId = account?.providerAccountId
                token.accessToken = account.oauth_token
                token.refreshToken = account.oauth_token_secret
            }
            return { ...token };
        },
        async signIn() {
            return true;
        },
        async session({ session, token }) {
            if (token?.userId && session.user) {
                session.user.id = token.userId as string
            }
            return session
        }
    },
    providers: [
        TwitterProvider({
            clientId: env.TWITTER_CLIENT_ID,
            clientSecret: env.TWITTER_CLIENT_SECRET,
            version: "1.1",
        }),
    ],
};

export default NextAuth(authOptions);
