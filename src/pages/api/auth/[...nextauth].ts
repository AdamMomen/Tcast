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
            console.log({ token })
            if (account && account.access_token) {
                token.accessToken = account?.oauth_token || ""
                token.refreshToken = account?.oauth_token_secret || ""
            }
            return { ...token };
        },
        async signIn() {
            return true;
        },
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
