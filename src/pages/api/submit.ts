import type { NextApiRequest, NextApiResponse } from 'next'
import { publishCast } from '@standard-crypto/farcaster-js';
import { AlchemyProvider } from "@ethersproject/providers";
import { env } from '../../env/server.mjs'
import { Wallet } from "ethers";
import Twitter from 'twitter-lite';
import { getToken } from 'next-auth/jwt';



/* TODO: complate me test if this is getting the right information.
    twApp
    .getRequestToken("oob")
    .then(res => {
    console.log(res)
        twClient = new Twitter({
        })
    })
    .catch(console.error);
*/

const validateRequest = (req: NextApiRequest, res: NextApiResponse<Data>) => {
    if (req.method !== 'POST') return res.status(300).end()
    if (!req.body.platforms) return res.status(200).json({
        error: "missing property `platforms` in the request body"
    })

    if (!req.body.text) return res.status(200).json({
        error: "missing property `text` in the request body"
    })
}

type Data = {
    result?: string | null
    error?: string | null
}

const publishTweet = async (client: any, message: string) => {
    if (!client) return

    // TODO: Please for the love of god fix this
    (client as Twitter).post('statuses/update', { status: message })
        .then(result => {
            console.log(`Successfully tweeted this: ${result.text}`);
        }).catch(console.error);
}

const publishCastMessage = async (message: string) => {
    const provider = new AlchemyProvider("goerli");
    const wallet = Wallet.fromMnemonic(env.NEMO);
    publishCast(wallet, provider, message)
        .then(result => {
            console.log(`Successfully casted this: ${result.body.data.text}`);
        }).catch(console.error);
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    req.body = JSON.parse(req.body)
    validateRequest(req, res)
    const token = await getToken({ req, secret: env.NEXTAUTH_SECRET })

    const client = new Twitter({
        extension: false,
        consumer_key: env.TWITTER_CLIENT_ID,
        consumer_secret: env.TWITTER_CLIENT_SECRET,
        // @ts-ignore
        access_token_key: token.twitter.oauth_token,
        // @ts-ignore
        access_token_secret: token.twitter.oauth_token_secret
    });

    const { platforms, text } = req.body

    if (platforms.farcaster) {
        await publishCastMessage(text)

    }
    if (platforms.twitter) {
        await publishTweet(client, text)
    }

    res.status(200).json({ result: 'success' })
}

export default handler
