import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ServerResponse } from "http";
import { timedQuery } from "../../../helpers/functions";
import { Numeric } from "@leopays-core/leopaysjs/dist";
import { getSkipLimit } from "../../v2-history/get_actions/functions";

function invalidKey() {
    const err: any = new Error();
    err.statusCode = 400;
    err.message = 'invalid public key';
    throw err;
}

async function getKeyAccounts(fastify: FastifyInstance, request: FastifyRequest) {

    let publicKey;
    if (typeof request.body === 'string' && request.req.method === 'POST') {
        request.body = JSON.parse(request.body);
    }

    const { skip, limit } = getSkipLimit(request.query);
    const maxDocs = fastify.manager.config.api.limits.get_key_accounts ?? 1000;

    const public_Key = request.req.method === 'POST' ? request.body.public_key : request.query.public_key;

    if (public_Key.startsWith("PUB_")) {
        publicKey = public_Key;
    } else if (public_Key.startsWith("LPC")) {
        try {
            publicKey = Numeric.convertLegacyPublicKey(public_Key);
        } catch (e) {
            console.log(e.message);
            invalidKey();
        }
    } else {
        invalidKey();
    }

    const response = {
        account_names: []
    } as any;

    if (request.req.method === 'GET' && request.query.details) {
        response.permissions = [];
    }

    try {

        const permTableResults = await fastify.elastic.search({
            index: fastify.manager.chain + '-perm-*',
            size: (limit > maxDocs ? maxDocs : limit) || 100,
            from: skip || 0,
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    "auth.keys.key.keyword": publicKey
                                }
                            }
                        ],
                    }
                }
            }
        });

        if (permTableResults.body.hits.hits.length > 0) {
            for (const perm of permTableResults.body.hits.hits) {
                response.account_names.push(perm._source.owner);
                if (request.req.method === 'GET' && request.query.details) {
                    response.permissions.push(perm._source);
                }
            }
        }

    } catch (e) {
        console.log(e);
    }

    if (response.account_names.length > 0) {
        response.account_names = [...(new Set(response.account_names))];
        return response;
    }

    // Fallback to action search
    const _body = {
        query: {
            bool: {
                should: [
                    { term: { "@updateauth.auth.keys.key.keyword": publicKey } },
                    { term: { "@newaccount.active.keys.key.keyword": publicKey } },
                    { term: { "@newaccount.owner.keys.key.keyword": publicKey } }
                ],
                minimum_should_match: 1
            }
        },
        sort: [{ "global_sequence": { "order": "desc" } }]
    };

    const results = await fastify.elastic.search({
        index: fastify.manager.chain + '-action-*',
        size: (limit > maxDocs ? maxDocs : limit) || 100,
        from: skip || 0,
        body: _body
    });

    if (results['body']['hits']['hits'].length > 0) {
        response.account_names = results['body']['hits']['hits'].map((v) => {
            if (v._source.act.name === 'newaccount') {
                if (v._source['@newaccount'].newact) {
                    return v._source['@newaccount'].newact;
                } else if (v._source.act.data.newact) {
                    return v._source.act.data.newact;
                } else {
                    return null;
                }
            } else if (v._source.act.name === 'updateauth') {
                return v._source.act.data.account;
            } else {
                return null;
            }
        });
    }

    if (response.account_names.length > 0) {
        response.account_names = [...(new Set(response.account_names))];
    }

    return response;
}

export function getKeyAccountsHandler(fastify: FastifyInstance, route: string) {
    return async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
        reply.send(await timedQuery(getKeyAccounts, fastify, request, route));
    }
}
