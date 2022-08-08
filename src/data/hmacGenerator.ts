import * as crypto from "crypto";
import * as moment from "moment";

class KeyGenerator {
    private _method : string = null!;
    private _url : string = null!;
    private _secretKey : string = null!;
    private _accessKey : string = null!;

    constructor(secretKey : string, accessKey : string){
        this._secretKey = secretKey;
        this._accessKey = accessKey;
    }

    async _generateKey(method : string, url : string) {
        this._method = method;
        this._url = url;

        const parts = url.split(/\?/);
        const [path, query = ''] = parts;

        const datetime = moment.utc().format('YYMMDD[T]HHmmss[Z]');
        const message = datetime + method + path + query;

        const signature = crypto.createHmac('sha256', this._secretKey)
            .update(message)
            .digest('hex');

        return `CEA algorithm=HmacSHA256, access-key=${this._accessKey}, signed-date=${datetime}, signature=${signature}`;
    }
}

export default KeyGenerator;