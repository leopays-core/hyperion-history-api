import { IncomingMessage, Server, ServerResponse } from "http";
import { Client } from "@elastic/elasticsearch";
import { Redis } from "ioredis";
import { ConnectionManager } from "../../connections/manager.class";
import { JsonRpc, Api } from "@leopays-core/leopaysjs/dist";

declare module 'fastify' {

    export interface FastifyInstance<HttpServer = Server,
        HttpRequest = IncomingMessage,
        HttpResponse = ServerResponse,
        > {
        manager: ConnectionManager
        redis: Redis;
        elastic: Client;
        leopaysjs: {
            rpc: JsonRpc,
            api: Api
        },
        chain_api: string,
        push_api: string,
        tokenCache: Map<string, any>
    }
}
