import { FastifyInstance } from "fastify";
import { addApiRoute, getRouteName } from "../../../helpers/functions";
import { getTransactionHandler } from "./get_transaction";

export default function (fastify: FastifyInstance, opts: any, next) {
    addApiRoute(fastify, 'POST', getRouteName(__filename), getTransactionHandler, {
        description: 'get all actions belonging to the same transaction',
        summary: 'get transaction by id',
        tags: ['history'],
        body: {
            type: ['object', 'string'],
            properties: { id: { description: 'transaction id', type: 'string' } },
            required: ["id"]
        }
    });
    next();
}
