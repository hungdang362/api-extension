import * as bcrypt from 'bcrypt';

export class PasswordEncoder {

    constructor() {
    }

    static async encoder(data: string, saltRound: number): Promise<any> {
        let result: string | null = null;

        await (new Promise(((resolve, reject) => {

            bcrypt.genSalt(saltRound, (err, salt) => {
                bcrypt.hash(data, salt, (herr, hashed) => {
                    if (herr) reject();
                    resolve(hashed);
                })
            });

        }))).then((hashed: string) => {
            result = hashed
        });

        return result;
    }

}