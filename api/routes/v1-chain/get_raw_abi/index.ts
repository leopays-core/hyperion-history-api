import { FastifyInstance } from "fastify";
import { addChainApiRoute, getRouteName } from "../../../helpers/functions";

export default function (fastify: FastifyInstance, opts: any, next) {
    addChainApiRoute(
        fastify,
        getRouteName(__filename),
        'Retrieves raw ABI for a contract based on account name',
        {
            "account_name": 'AccountName#'
        },
        ["account_name"]
    );
    next();
}
