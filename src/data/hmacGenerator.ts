import * as crypto from "crypto";
import * as moment from "moment";
import DEFINES from "../../defines/defines";

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

        const parts = this._url.split(/\?/);
        const [path, query = ''] = parts;

        const datetime = moment.utc().format('YYMMDD[T]HHmmss[Z]');
        const message = datetime + this._method + path + query;

        console.log(datetime, message);
        const signature = crypto.createHmac('sha256', this._secretKey)
            .update(message)
            .digest('hex');

        return `CEA algorithm=HmacSHA256, access-key=${this._accessKey}, signed-date=${datetime}, signature=${signature}`;
    }
}

export default KeyGenerator;

let test = new KeyGenerator(DEFINES.KEYS.SECRET_KEY,DEFINES.KEYS.ACCESS_KEY);
test._generateKey("GET","https://api-gateway.coupang.com/v2/providers/affiliate_open_api/apis/openapi/v1/products/bestcategories/1016").then((key)=>{
    console.log(key);
});