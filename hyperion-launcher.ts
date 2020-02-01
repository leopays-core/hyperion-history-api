import * as cluster from "cluster";
import {ConfigurationModule} from "./modules/config";
import {onError} from "./helpers/functions";

interface WorkerEnv {
    worker_role: string;
    worker_id: string;
}

const hyperionWorkers = {
    ds_pool_worker: 'ds_pool.worker',
    reader: 'state-reader.worker',
    deserializer: 'deserializer.worker',
    continuous_reader: 'state-reader.worker',
    ingestor: 'indexer.worker',
    router: 'ws-router.worker'
};

export async function launch() {

    const conf = new ConfigurationModule();
    const chain_name = conf.config.settings.chain;
    const env: WorkerEnv = {
        worker_id: process.env.worker_id,
        worker_role: process.env.worker_role
    };

    if (cluster.isMaster) {
        process.title = `hyp-${chain_name}-master`;
        const master = await import('./modules/master');
        new master.HyperionMaster().runMaster().catch(onError);
    } else {
        if (hyperionWorkers[env.worker_role]) {
            process.title = `hyp-${chain_name}-${env.worker_role}:${env.worker_id}`;
            const mod = await import(`./workers/${hyperionWorkers[env.worker_role]}`);
            mod.run().catch(onError);
        } else {
            console.log(`FATAL: Unlisted Worker: ${env.worker_role}`);
        }
    }
}