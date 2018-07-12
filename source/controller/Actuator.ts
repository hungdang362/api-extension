import { autoInject, ConfigContract, Environment, Logger, Context, Router, Http } from 'api-framework'
import { MicroService } from '../network/MicroService';

import * as fs from 'fs';

@autoInject
export class Actuator {

    constructor(
        private readonly config: ConfigContract,
        private readonly microService: MicroService,
        private readonly logger: Logger,
        router: Router
    ) {
        if (this.config.env != Environment.PROD) {
            router.register(this)
        }
    }

    @Http.get('/actuator')

    async actuator(ctx: Context) {

        const { instanceConfig: { ipAddr, port } } = this.microService;
        const base = `http://${ipAddr}:${port}`;

        ctx.body = {
            _links: {
                self: { href: `${base}/actuator`, templated: false },
                health: { href: `${base}/actuator/health`, templated: false },
                info: { href: `${base}/actuator/info`, templated: false },
                logfile: { href: `${base}/actuator/logfile`, templated: false }
            }
        };
    }

    @Http.get('/actuator/health')

    async actuatorHealth(ctx: Context) {

        ctx.body = {
            status: 'UP',
            db: { name: 'postgres', status: 'UP', type: 'DB' },
            queue: { name: 'rabbitmq', status: 'UP' }
        };

    }

    @Http.get('/health')

    async health(context: Context) {
        context.body = {
            status: 'UP'
        };

    }

    @Http.get('/actuator/logfile')

    async logfile(ctx: Context | any) {
        let { range = 'bytes=-' } = ctx.header;
        const { filename } = this.logger;

        if (!filename) {
            ctx.body = '';
            return;
        }

        const [from, to] = range.split('=').pop().split('-');

        const { data, offset, length, end, fileSize } = calc(filename, from, to);

        ctx.response.set('content-type', 'text/plain');
        ctx.response.set('accept-ranges', 'bytes');
        ctx.response.set('content-length', length);
        ctx.response.set('content-range', `bytes ${offset}-${end}/${fileSize}`);

        ctx.status = 206;
        ctx.body = data;
    }


    @Http.get('/actuator/info')

    async info(ctx: Context) {
        const authHeader = process.env.APP_ENV == 'local' ? JSON.parse(ctx.request.headers['auth-info'] || '{}') : {};

        ctx.body = { APP: this.config.name, header: authHeader }
    }

}

function calc(file: string, from?: number, to?: number) {

    const fileSize = fs.statSync(file).size;

    let offset = 0;
    let length = 0;

    if (from && !to) {
        offset = from;
        length = fileSize - from;
    } else if (!from && to) {
        offset = Math.max(fileSize - to, 0);
        length = fileSize - offset;
    } else if (from && to) {
        offset = from;
        length = to - from;
    } else {
        offset = 0;
        length = fileSize;
    }

    offset = +offset;
    length = +length;

    let buffer = new Buffer(length);
    const fd = fs.openSync(file, 'r');
    fs.readSync(fd, buffer, 0, length, offset);


    return {
        data: buffer.toString('utf8'),
        offset,
        length,
        end: length + offset - 1,
        fileSize
    }
}