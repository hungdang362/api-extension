import * as crypto from 'crypto';
import * as lodash from 'lodash';
import * as qs from 'qs';


export interface Gateway {
    paymentUrl: string;
    merchantId: string;
    accessCode: string;
    secret: Buffer;
}


export function createUrl(gateway: Gateway, payment) {

    const query = createQuery(gateway, payment);
    const hash = calcHash(gateway, query);

    query.vpc_SecureHash = hash;
    return gateway.paymentUrl + '?' + qs.stringify(query);

}


function createQuery(gateway: Gateway, payment): any {
    return {
        vpc_MerchTxnRef: null || ('ECA-' + Date.now()),
        vpc_Amount:      null || 1e6,
        vpc_OrderInfo:   null || 'ECA',

        vpc_Merchant:   gateway.merchantId,
        vpc_AccessCode: gateway.accessCode,

        vpc_TicketNo:  null || '127.0.0.1',
        vpc_ReturnURL: payment.returnUrl,

        vpc_Version:  2,
        vpc_Currency: 'VND',
        vpc_Command:  'pay',
        vpc_Locale:   'en',
    };
}


function calcHash(gateway: Gateway, query: Object) {

    const data = lodash(query as any)
        .toPairs<string>()
        .filter(pair => pair[0].startsWith('vpc'))
        .sortBy(pair => pair[0])
        .map(pair => pair[0] + '=' + pair[1])
        .join('&');

    const hmac = crypto.createHmac('sha256', gateway.secret);
    hmac.update(data);

    const digest = hmac.digest('hex');
    return digest.toUpperCase();

}
