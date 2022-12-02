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

        const twitterClient = new TwitterApi(env.BEARER_TOKEN);

        const result = await twitterClient.v1.users({ screen_name: 'ThatAdamMomen' })
        console.log('res', res)



        res.status(200).json({ result })
    }
    catch (e) {
        res.status(400).json({ error: e })
    }
}
export default handler
