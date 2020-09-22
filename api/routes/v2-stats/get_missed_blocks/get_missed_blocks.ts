import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { timedQuery } from "../../../helpers/functions";
import { ServerResponse } from "http";
import { Search } from "@elastic/elasticsearch/api/requestParams";
import { applyTimeFilter } from "../../v2-history/get_actions/functions";

async function getMissedBlocks(fastify: FastifyInstance, request: FastifyRequest) {
    const response = {
        stats: {
            by_producer: {}
        },
        events: []
    };
    const searchParams: Search<any> = {
        track_total_hits: true,
        index: fastify.manager.chain + "-logs-*",
        size: 100,
        body: {
            query: {
                bool: {
                    must: [
                        { term: { "type": "missed_blocks" } }
                    ]
                }
            },
            sort: {
                "@timestamp": "desc"
            }
        }
    };

    let minBlocks = 0;
    if (request.query.min_blocks) {
        minBlocks = parseInt(request.query.min_blocks);
        searchParams.body.query.bool.must.push({ range: { "missed_blocks.size": { gte: minBlocks } } })
    }

    if (request.query.producer) {
        searchParams.body.query.bool.must.push({ term: { "missed_blocks.producer": request.query.producer } });
    }

    applyTimeFilter(request.query, searchParams.body.query);

    const apiResponse = await fastify.elastic.search(searchParams);
    apiResponse.body.hits.hits.forEach(v => {
        const ev = v._source;
        response.events.push({
            "@timestamp": ev["@timestamp"],
            ...ev.missed_blocks
        });
        if (!response.stats.by_producer[ev.missed_blocks.producer]) {
            response.stats.by_producer[ev.missed_blocks.producer] = ev.missed_blocks.size;
        } else {
            response.stats.by_producer[ev.missed_blocks.producer] += ev.missed_blocks.size;
        }
    });
    return response;
}

export function getMissedBlocksHandler(fastify: FastifyInstance, route: string) {
    return async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
        reply.send(await timedQuery(getMissedBlocks, fastify, request, route));
    }
}
