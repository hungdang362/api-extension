import { Eureka as Client } from 'eureka-js-client'
import { ConfigContract, autoInject, Logger } from 'api-framework';

import resilient = require('resilient');
import { firstNonLoopback } from './NicsHelper';

@autoInject
export class MicroService {

    private client: Client | any;

    private instanceId: string;
    private homePageUrl: string;

    private instances = new Map<String, Object>();

    public instanceConfig: Instance;

    constructor(
        readonly config: ConfigContract,
        readonly logger: Logger
    ) {

        const { listen, registry: { eureka: { instance, server: { proto = 'http' } } } } = config;

        const defaultIP = firstNonLoopback().address;

        this.instanceConfig = {
            hostName: instance.host || defaultIP,
            ipAddr: instance.addr || defaultIP,
            port: instance.port || listen.port
        };

        this.instanceId = `${this.instanceConfig.ipAddr}:${config.name}:${config.listen.port}`;
        this.homePageUrl = `${proto}://${this.instanceConfig.ipAddr}:${config.listen.port}`;

        this.init();
        this.start();
    }

    init() {

        const { config, homePageUrl, instanceId, logger } = this;
        const { 'name': app, registry: { eureka: { instance, server } } } = config;
        const { hostName, ipAddr, port } = this.instanceConfig;

        this.client = new Client({
            logger,
            instance: {
                instanceId, app, hostName, ipAddr,
                port: {
                    '$': port,
                    '@enabled': true,
                },
                vipAddress: app.toLowerCase(),
                dataCenterInfo: {
                    '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
                    name: 'MyOwn',
                },
                metadata: {
                    'management.address': ipAddr,
                    'management.port': port
                },
                homePageUrl: `${homePageUrl}/`,
                healthCheckUrl: `${homePageUrl}/health`,
                statusPageUrl: `${homePageUrl}/info`,
                leaseInfo: {
                    renewalIntervalInSecs: instance.renewalIntervalInSecs,
                    durationInSecs: instance.durationInSecs
                }
            },
            eureka: {
                host: server.host,
                port: server.port,
                servicePath: '/eureka/apps/',
                registryFetchInterval: instance.registryFetchInterval,
                fetchRegistry: true
            },
        } as any);

        this.client.on('registryUpdated', this.update.bind(this));

    }

    get instance(): Client {
        return this.client;
    }

    get services() {
        return this.instances;
    }

    start() {
        this.client.start();
    }

    stop() {
        this.client.stop();
    }

    update() {
        const { logger, instances, client: { cache: { 'app': apps } } } = this;

        instances.clear();

        for (const name in apps) {
            const app = apps[name];

            const servers = app.map((instance) => {
                return `http://${instance.ipAddr}:${instance.port.$}`;
            })

            const balancer = resilient();
            balancer.setServers(servers);

            instances.set(name.toLowerCase(), balancer);
        }

        logger.debug(`Fetch Registry: (${Object.keys(apps).length}) services`);
    }

    get(name: string) {
        const { logger, instances } = this;

        if (!instances.has(name)) {
            logger.warn(`Service "${name}" not found`);

            return null;
        }

        return instances.get(name);
    }

}

interface Instance {
    ipAddr: string;
    hostName?: string;
    port: number;
}
