import { Controller, Http, Context } from "api-framework";
import * as os from 'os';

@Controller('/actuator/metrics')
export class Metric {

    private lastCpuUsage = process.cpuUsage();

    @Http.get('')

    async listing(ctx: Context) {
        ctx.body = {
            names: [
                'jvm.memory.used',
                'jvm.memory.committed',
                'jvm.memory.max',
                'process.cpu.usage',
                'system.cpu.usage',
                'process.uptime',
                'system.cpu.count'
            ]
        };
    }

    @Http.get('/jvm.memory.max')

    async totalMem(ctx: Context) {
        const { tag } = ctx.request.query;
        const { rss, heapTotal } = process.memoryUsage();

        ctx.body = build('jvm.memory.max', tag === 'area:nonheap' ? rss : heapTotal);
    }

    @Http.get('/jvm.memory.used')

    async usedMem(ctx: Context) {
        const { tag } = ctx.request.query;
        const { heapUsed, external, heapTotal } = process.memoryUsage();

        ctx.body = build('jvm.memory.used', tag === 'area:nonheap' ? (heapTotal + external) : heapUsed);
    }

    @Http.get('/jvm.memory.committed')

    async commitedMem(ctx: Context) {
        const { tag } = ctx.request.query;
        const { rss, heapTotal } = process.memoryUsage();

        ctx.body = build('jvm.memory.max', tag === 'area:nonheap' ? rss : heapTotal);
    }

    @Http.get('/process.cpu.usage')

    async processUsage(ctx: Context) {
        const current = process.cpuUsage();

        const val = (current.user - this.lastCpuUsage.user) / 1000 / 1000;

        ctx.body = build('process.cpu.usage', val);
    }

    @Http.get('/system.cpu.usage')

    async systemUsage(ctx: Context) {
        ctx.body = build('system.cpu.usage', os.loadavg()[0]);
    }

    @Http.get('/process.uptime')

    async uptime(ctx: Context) {
        ctx.body = build('process.uptime', process.uptime());
    }

    @Http.get('/system.cpu.count') 

    async cpus(ctx:Context) {
        ctx.body = build('system.cpu.count', os.cpus().length)
    }


}

function build(name, value, statistic = 'VALUE', availableTags = []) {
    return {
        name,
        measurements: [{ statistic, value }],
        availableTags
    }
}