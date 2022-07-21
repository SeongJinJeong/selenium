import * as crypto from "crypto";
import * as moment from "moment";

class KeyGenerator {
    private _method : string = null!;
    private _url : string = null!;
    private _secretKey : string = null!;
    private _accessKey : string = null!;

    constructor(method : string, url : string, secretKey : string, accessKey : string){
        this._method = method;
        this._url = url;
        this._secretKey = secretKey;
        this._accessKey = accessKey;
    }

    async _generateKey() : Promise<string> {
        const parts = this._url.split(/\?/);
        const [path, query = ''] = parts;

        const datetime = moment.utc().format('YYMMDD[T]HHmmss[Z]');
        const message = datetime + this._method + path + query;

        const signature = crypto.createHmac('sha256', this._secretKey)
            .update(message)
            .digest('hex');

        return `CEA algorithm=HmacSHA256, access-key=${this._accessKey}, signed-date=${datetime}, signature=${signature}`;
    }
}

export default KeyGenerator;