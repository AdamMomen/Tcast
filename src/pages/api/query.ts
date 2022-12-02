import { NextApiRequest, NextApiResponse } from "next";
import { env } from '../../env/server.mjs'
import { TwitterApi } from 'twitter-api-v2';
import { ApiError } from "next/dist/server/api-utils/index.js";

type Data = {
    success: boolean;
    result?: any;
    error?: any
}

const validateRequest = (req: NextApiRequest, res: NextApiResponse<Data>) => {
    console.log('query', req.query)
    console.log('method', req.method)
    if (req.method !== "GET") return res.status(300).end()
    if (!req.query || !req.query.screen_name) throw new ApiError(400, "Missing paramater `screen_name` in the request query")
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    try {

        console.log('here')
        validateRequest(req, res)
        const twitterClient = new TwitterApi(env.BEARER_TOKEN);


        const result = await twitterClient.v1.users({ screen_name: 'ThatAdamMomen' })
        console.log('Found Result', result)

        res.status(200).json({ success: true, result })
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

        res.status(error?.statusCode || 500).json(response)
    }
}
export default handler
