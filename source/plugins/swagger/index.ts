/// <reference types="reflect-metadata" />

import { HttpMetadata } from 'api-framework';
import { Doc, Swagger } from './Register';
import { Controller } from './Controller';

const DOC_LIST = Symbol('document:list');

const Document = function (doc) {
    return function (target, property) {

        const Http = HttpMetadata.get(target);
        const meta = Http.get(property);

        if (!meta) return;

        const value = Reflect.getMetadata(DOC_LIST, target);
        const list = (value as Map<String, Doc>) || new Map<String, Doc>();

        list.set(property, { doc, method: meta.httpMethod, path: meta.routePath });

        Reflect.defineMetadata(DOC_LIST, list, target);
    }
}

const DocMetaData = {
    get: function (target): Map<String, Doc> {
        return Reflect.getMetadata(DOC_LIST, target);
    }
}


export { Document, DocMetaData, Controller, Swagger };