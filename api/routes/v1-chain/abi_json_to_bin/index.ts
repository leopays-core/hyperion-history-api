import { FastifyInstance } from "fastify";
import { addChainApiRoute, getRouteName } from "../../../helpers/functions";

export default function (fastify: FastifyInstance, opts: any, next) {
    addChainApiRoute(
        fastify,
        getRouteName(__filename),
        'Convert JSON object to binary',
        {
            "binargs": {
                "type": "string",
                "pattern": "^(0x)(([0-9a-f][0-9a-f])+)?$",
                "title": "Hex"
            }
        },
        ["binargs"]
    );
    next();
}
