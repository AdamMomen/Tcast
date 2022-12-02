import { env } from '../../env/server.mjs'

const getFarcasterPKByTwitterId = (tid: string): string | null => {
    switch (tid) {
        case "1046537020468854784": // Victor's twitter id
            return env.VICTOR_FC_PK

        case "840997292131926016": // Alex's twitter id
            return env.ALEX_FC_PK

        default:
            return null
    }
}

export default getFarcasterPKByTwitterId
