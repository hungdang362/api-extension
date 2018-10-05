import { autoInject, Storage, Context, Next, Middleware } from 'api-framework';

import * as _ from 'lodash';

const USER = Symbol('user');

@autoInject
export class Session {

    constructor(protected readonly storage: Storage) {
    }

    private async handle(context: Context, next: Next) {

        const header = JSON.parse(context.get('auth-info') || '{}');

        const parsed = { ...{ name: '', authorities: [] }, ...header };

        const authorities = _.keyBy(parsed.authorities, o => o.authority);

        this.storage.set(USER, { header, authorities, name: parsed.name });

        await next();
    }

    get name(): string {
        const { name = null } = this.storage.get(USER);

        return name;
    }

    get authorities(): string[] {
        const { authorities = [] } = this.storage.get(USER);

        return authorities;
    }

    middleware(): Middleware {
        return this.handle.bind(this);
    }

    is(role: string) {
        return !!this.authorities[role];
    }

}
