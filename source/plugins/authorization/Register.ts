import { Session } from './Session';
import * as _ from 'lodash';
import { Forbidden } from 'api-framework';


function isEqual(lVal, rVal): boolean {
    if (_.isString(lVal)) return lVal === rVal;

    return _.difference(lVal, this).length === 0;
}

export function Secured(...permissions: string[]) {

    return function annotate(target, property, descriptor) {

        const method: Function = descriptor.value;

        if (permissions.length > 0) {

            descriptor.value = function (...args) {

                const session: Session = (global as any).__injector.get(Session);
                const roles = _.keys(session.authorities);

                const diff = _.differenceWith(permissions, roles, isEqual.bind(roles));

                if (diff.length == permissions.length) throw new Forbidden();

                method.apply(this, args);
            }

        }

    }

}