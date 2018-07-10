import { autoInject, ConfigContract, Environment, Context } from 'api-framework'
import { Router, Http } from 'api-framework';

import { Swagger } from './Register';

@autoInject
export class Controller {

    constructor(
        private readonly config: ConfigContract,
        private readonly swagger: Swagger,
        router: Router
    ) {
        if (this.config.env != Environment.PROD) {
            router.register(this)
        }
    }


    @Http.get('/v2/api-docs')

    async doc(ctx: Context) {
        const { name } = this.config;

        ctx.body = {
            swagger: '2.0',
            info: {
                title: name,
                version: '2.0'
            },
            paths: this.swagger.docs
        };
    }

}