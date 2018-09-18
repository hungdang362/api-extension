/// <reference types="reflect-metadata" />

import { HttpMetadata } from 'api-framework';
import { Doc, Swagger, EnableSwagger } from './Register';
import { Controller } from './Controller';

const DOC_LIST = Symbol('document:list');

const Document = function (doc) {

    return function (target, property) {

        const annonations = HttpMetadata.get(target) || [];
        for (const route of annonations) {

            if (route.property !== property) continue;

            const value = Reflect.getMetadata(DOC_LIST, target);
            const list = value as Doc[] || [];

            list.push({ doc, method: route.httpMethod, path: route.routePath });

            Reflect.defineMetadata(DOC_LIST, list, target);
        }

    }

}

const DocMetaData = {
    get: function (target): Doc[] {
        return Reflect.getMetadata(DOC_LIST, target) || [];
    }
}


export { Document, DocMetaData, Controller, Swagger, EnableSwagger };