import { autoInject, ConfigContract } from 'api-framework';
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

    constructor(config: ConfigContract) {
        this.prefix = config.source.path;
    }

    async register(target) {
        const { prefix, docs } = this;
        const list = DocMetaData.get(target);

        for (const { doc, path, method } of list.values()) {

            const data = await (Parser as any).dereference(_.join(prefix, doc));

            docs[path] = docs[path] || {};
            docs[path][method] = data;
        }

    }

}