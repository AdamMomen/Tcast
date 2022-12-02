import type { NextApiRequest, NextApiResponse } from 'next'
import { publishCast } from '@standard-crypto/farcaster-js';
import { AlchemyProvider } from "@ethersproject/providers";
import { env } from '../../env/server.mjs'
import { Wallet } from "ethers";
import { TwitterApi } from 'twitter-api-v2';
import { getToken, JWT } from 'next-auth/jwt';
import getFCpkByTwitterId from '../../server/common/get-farcaster-private-keys-by-twitter-id'
import { ApiError } from 'next/dist/server/api-utils/index.js';

type Data = {
    success: boolean;
    result?: any;
    error?: any
}

type PublishTweetOpts = {
    media: {
        name: string;
        data: string
        mimeType: string;
    }
    accessToken?: string | undefined;
    accessSecret?: string | undefined;
}

const validateRequest = (req: NextApiRequest, res: NextApiResponse<Data>, token: JWT | null) => {
    console.log(req.body)
    if (req.method !== 'POST') return res.status(300).end()
    else if (!req.body.platforms) throw new ApiError(400, "missing property `platforms` in the request body")

    const activatedPlatforms = Object.keys(req.body.platforms)
        .map((key) => { if (req.body.platforms[key]) return key })
        .filter(el => el)

    if (!activatedPlatforms || !activatedPlatforms.length) throw new ApiError(400, "Must select at least one platform")
    else if (!req.body.text) throw new ApiError(400, "missing property `text` in the request body")
    else if (!token) throw new ApiError(400, "Missing Twitter Access Tokens")
}

const publishTweet = async (message: string, options: PublishTweetOpts) => {
    console.log(`tweeting ${message}`)

    const { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } = env
    console.log({ options })

    const client = new TwitterApi({
        appKey: TWITTER_CLIENT_ID,
        appSecret: TWITTER_CLIENT_SECRET,
        ...options
    })

    let mediaId = undefined;

    if (options.media) {
        const { data } = options.media

        mediaId = await client.v1.uploadMedia(
            Buffer.from(data, 'binary'),
            {
                mimeType: options.media.mimeType,
            }
        )
    }

    return client.v1.tweet(message, { media_ids: mediaId })
}

const publishCastMessage = async (message: string, privateKey: string) => {
    const provider = new AlchemyProvider("goerli");
    const wallet = Wallet.fromMnemonic(privateKey);
    publishCast(wallet, provider, message)
        .then(result => {
            console.log(`Successfully casted this: ${result.body.data.text}`);
        }).catch(console.error);
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    try {

        const secret = env.NEXTAUTH_SECRET;
        const token = await getToken({ req, secret })

        req.body = JSON.parse(req.body)
        validateRequest(req, res, token)

        //@ts-ignore
        const { accessToken, refreshToken: accessSecret, userId: twitterId }
            = await getToken({ req, secret: env.NEXTAUTH_SECRET })

        let result = undefined;

        const { platforms, text, media } = req.body

        if (platforms.farcaster) {
            const fcPrivateKey = getFCpkByTwitterId(twitterId)
            if (!fcPrivateKey) throw new ApiError(500, 'Couldn not find User Farcaster Private Key')
            result = await publishCastMessage(text, fcPrivateKey)
        }

        if (platforms.twitter) {
            result = await publishTweet(text, {
                accessToken,
                accessSecret,
                media
            })
        }

        console.log('result is:', result)

        const activatedPlatforms = Object.keys(platforms)
            .map((key) => { if (platforms[key]) return key })
            .filter(el => el)

        res.status(200).json({
            success: true, result: `Successfully posted to ${activatedPlatforms
                .join(' and ')
                }`
        })
    }

    catch (error: any) {
        const response =
        {
            success: false,
            error:
                error?.message ?
                    { message: error.message } :
                    error
        }

        res.status(error?.statusCode).json(response)

    }
}

export default handler
