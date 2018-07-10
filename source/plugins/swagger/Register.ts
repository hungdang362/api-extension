import { autoInject, ConfigContract, Logger } from 'api-framework';
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

    private prefix: string;
    public docs = {};


    async register(target, prefix = '') {

        const { docs } = this;
        const metaData = DocMetaData.get(target);

        for (const { doc, path, method } of metaData.values()) {

            const data = await (Parser as any).dereference(_.resolve(_.join(prefix, doc)));

            docs[path] = docs[path] || {};
            docs[path][method] = data;
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

                injector.get(Swagger).register(this, prefix);
            }
        }
    }

}