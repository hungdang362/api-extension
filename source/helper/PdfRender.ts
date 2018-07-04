import * as pdf from 'html-pdf';
import * as fs from 'fs';
import * as handlebars from 'handlebars';

export class PdfRender {

    constructor() {
        handlebars.registerHelper('breakpage', function (index: number, max_per_page: number, opts) {
            if ((index % max_per_page) == 0) {
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        });
    }

    async make(file: string, replacements: any, options: any) {

        let buffer;
        const content  = fs.readFileSync(file, 'utf8');
        const template = handlebars.compile(content);
        const html     = template(replacements);

        await new Promise(((resolve, reject) => {

            pdf.create(html, options as any).toBuffer((err, res) => {
                resolve(res);
            });

        })).then((result) => {
            buffer = result;
        }).catch((err) => {
            buffer = err;
        });

        return buffer;
    }

}