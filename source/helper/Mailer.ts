import { autoInject, ConfigContract } from 'api-framework';
import * as Handlebars from 'handlebars';
import * as mailer from 'nodemailer';
import { Attachment } from 'nodemailer/lib/mailer';

import { readFileSync } from 'fs';

@autoInject
export class Mailer {

    private readonly transporter: mailer.Transporter;

    constructor(private config: ConfigContract) {
        const transportAttr = Object.assign({ name: 'default' }, (config as any).transport);

        this.transporter = mailer.createTransport(transportAttr);
    }


    send(recipient: string, subject: string, html: string, bcc?: string,
        attachments?: Attachment[], success?: (info: any) => void, error?: (error: any) => void) {

        const from = (this.config as any).mailer.from;
        const to = recipient;

        const promise: Promise<mailer.SentMessageInfo> =
            this.transporter.sendMail({ from, to, subject, html, attachments, bcc }) as any;

        promise.then(info => {
            if (success) success(info);
        }, error => {
            if (error) error(error);
        });

        return promise;
    }

    sendWithTemplate(file: string, replacements: any, recipient: string, subject: string, bcc?: string,
        attachments?: Attachment[], success?: (info: any) => void, error?: (error: any) => void) {

        const content: string = readFileSync(file).toString();
        const template = Handlebars.compile(content);

        return this.send(recipient, subject, template(replacements), bcc, attachments, success, error);
    }

}
