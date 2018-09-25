import * as os from 'os';
import * as _ from 'lodash';

interface Address {
    address: string;
    netmask: string;
    family: string;
    mac: string;
    internal: string;
    cidr: string;
}

export function firstNonLoopback(): Address {
    return _.find(_.flatMapDeep(os.networkInterfaces()), (ifc) => !ifc.internal && ifc.family === 'IPv4') as any;
}

export function hostName() {
    return os.hostname();
}
