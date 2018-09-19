import { autoInject, ConfigContract, Logger, Prefix } from 'api-framework';
import * as Parser from 'json-schema-ref-parser';
import * as _ from 'path';

import { DocMetaData } from '.';

export interface Doc {
    path: string;
    doc: string;
    method: string;
}

@autoInject
export class Swagger {

    public docs = {};


    async register(controller, serviceName, prefix = '') {

        const { docs } = this;
        const metaData = DocMetaData.get(controller);

        const uriPrefix = Prefix.get(controller);

        for (const { doc, path, method } of metaData) {

            const data = await (Parser as any).dereference(_.resolve(_.join(prefix, doc)));
            const formated = `/${serviceName}${uriPrefix}${path}`

            docs[formated] = docs[formated] || {};
            docs[formated][method] = data;
        }

    }

}

export function EnableSwagger(prefix = 'source') {

    return function <T extends { new(...args) }>(constructor: T) {

        return class extends constructor {

            constructor(...args) {
                super(...args);

                const injector = (global as any).__injector;
                if (!injector) {
                    injector.get(Logger).error('[Injector] Swagger Instance not found.')
                    return;
                }

                const config = injector.get(ConfigContract);

                injector.get(Swagger).register(this, config.name, prefix);
            }
        }
    }

}