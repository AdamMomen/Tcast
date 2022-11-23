import type { NextApiRequest, NextApiResponse } from 'next'
import { publishCast as _ } from '@standard-crypto/farcaster-js';
import { AlchemyProvider } from "@ethersproject/providers";
import { env } from '../../env/server.mjs'
import { Wallet } from "ethers";

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

const wait = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms))

const publishTweet = async (message: string) => {
    console.log(`Tweeting ${message}`)
    await wait(3000)
}

const publishCastMessage = async (message: string) => {
    console.log(`Casting ${message}`)
    const provider = new AlchemyProvider("goerli");
    const wallet = Wallet.fromMnemonic(env.NEMO);
    await wait(3000)
    // publishCast(wallet, provider, text)
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
