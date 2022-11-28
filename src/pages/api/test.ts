import { NextApiRequest, NextApiResponse } from "next";
import { env } from '../../env/server.mjs'
import Twitter from 'twitter-lite';
import { TwitterApi } from 'twitter-api-v2';
import { getToken } from 'next-auth/jwt';
import { warn } from "console";

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    try {

        // @ts-ignore
        const { accessToken, refreshToken }
            = await getToken({ req, secret: env.NEXTAUTH_SECRET })
        const API_KEY = "nRQNY5OVoFyYiNe7wPp6f6Zo3"
        const API_KEY_SECRET = "g3uJxghb4IxfYNl3Sg143Glm0My5uz0aFHgL5nG5GUif2lOpWP"
        const BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAATnjgEAAAAAGZF7wN%2FtM7HAQlstTzvf7%2FrYQiI%3DA56K2YsnL5W2Urx0eOMygaEfyCIb8DcvJA35Bo3omi2RwrfUd9"
        const CLIENT_ID = "MGZ5c0FRRkxaLUdIOUFubDNncFU6MTpjaQ"
        const CLIENT_SECRET = "DXHPkprMQ4eTlCgMYLOTMM7ii8alppJZ1to74LM9P9LfTx6JAo"

        const twitterClient = new TwitterApi({
            appKey: CLIENT_ID,
            appSecret: CLIENT_SECRET,
            accessSecret: refreshToken,
            accessToken
        });

        const result = await twitterClient.v2.search({query: 'hi'})
        console.log('res', res)


        /*
    const user = new Twitter({
        version: "2",
        extension: false,
        consumer_key: env.TWITTER_CLIENT_ID,
        consumer_secret: env.TWITTER_CLIENT_SECRET,
        access_token_key,
        access_token_secret,
    });
    const result =
        user
            .get("account/verify_credentials")
            .then(results => {
                console.log("results", results);
            })
            .catch(console.error)
    await user.get('users/me', {
        screen_name: 'twitterapi',
        count: 2,
    });
    */

        res.status(200).json({ result })
    }
    catch (e) {
        res.status(400).json({ error: e })
    }
}
export default handler
