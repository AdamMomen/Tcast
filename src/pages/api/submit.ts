import type { NextApiRequest, NextApiResponse } from 'next'
import { publishCast } from '@standard-crypto/farcaster-js';
import { AlchemyProvider } from "@ethersproject/providers";
import { env } from '../../env/server.mjs'
import { Wallet } from "ethers";
import { TwitterApi } from 'twitter-api-v2';
import { getToken } from 'next-auth/jwt';

type Data = {
    result?: any;
    error?: string | null
}

type PublishTweetOpts = {
    accessToken?: string | undefined;
    accessSecret?: string | undefined;
}

const validateRequest = (req: NextApiRequest, res: NextApiResponse<Data>) => {
    if (req.method !== 'POST') return res.status(300).end()
    if (!req.body.platforms) return res.status(200).json({
        error: "missing property `platforms` in the request body"
    })

    if (!req.body.text) return res.status(200).json({
        error: "missing property `text` in the request body"
    })
}

const publishTweet = async (message: string, options: PublishTweetOpts) => {
    console.log(`tweeting ${message}`)

    const { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } = env

    const client = new TwitterApi({
        appKey: TWITTER_CLIENT_ID,
        appSecret: TWITTER_CLIENT_SECRET,
        ...options
    })

    return client.v2.tweet(message)
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

    const secret = env.NEXTAUTH_SECRET;
    const token = await getToken({ req, secret })
    if (!token) return res.status(200).json({
        error: "Missing twitter access tokens"
    })
    req.body = JSON.parse(req.body)
    validateRequest(req, res)

    //@ts-ignore
    const { accessToken, refreshToken: accessSecret }
        = await getToken({ req, secret: env.NEXTAUTH_SECRET })


    let result = undefined;
    const { platforms, text } = req.body

    if (platforms.farcaster) {
        result = await publishCastMessage(text)
    }

    if (platforms.twitter) {
        result = await publishTweet(text, {
            accessToken,
            accessSecret
        })
    }

    res.status(200).json({ result })
}

export default handler
