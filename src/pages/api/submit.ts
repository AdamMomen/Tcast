import type { NextApiRequest, NextApiResponse } from 'next'
import { publishCast } from '@standard-crypto/farcaster-js';
import { AlchemyProvider } from "@ethersproject/providers";
import { env } from '../../env/server.mjs'
import { Wallet } from "ethers";
import Twitter from 'twitter-lite';

const client = new Twitter({
    consumer_key: env.TWITTER_CLIENT_ID,
    consumer_secret: env.TWITTER_CLIENT_SECRET,

})



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

const publishTweet = async (message: string) => {
    console.log(`Tweeting ${message}`)
    // client.post()
}

const publishCastMessage = async (message: string) => {
    console.log(`Casting ${message}`)
    const provider = new AlchemyProvider("goerli");
    const wallet = Wallet.fromMnemonic(env.NEMO);
    publishCast(wallet, provider, message)
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    req.body = JSON.parse(req.body)
    validateRequest(req, res)

    const { platforms, text } = req.body

    if (platforms.farcaster) {
        await publishCastMessage(text)

    }
    if (platforms.twitter) {
        await publishTweet(text)
    }

    res.status(200).json({ result: 'success' })
}

export default handler
