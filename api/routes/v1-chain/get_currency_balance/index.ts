import { FastifyInstance } from "fastify";
import { addChainApiRoute, getRouteName } from "../../../helpers/functions";

export default function (fastify: FastifyInstance, opts: any, next) {
    addChainApiRoute(
        fastify,
        getRouteName(__filename),
        'Retrieves the current balance',
        {
            "code": 'AccountName#',
            "account": 'AccountName#',
            "symbol": 'Symbol#',
        },
        ["code", "account", "symbol"]
    );
    next();
}
