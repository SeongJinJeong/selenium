import axios, { Axios, AxiosError, AxiosResponse, Method } from "axios";
import DEFINES from "../../defines/defines";
import KeyGenerator from "./hmacGenerator"
import DataManager from "./DataManager"

class Data {
    private _keyGen : KeyGenerator = null!;

    private REQUEST_METHOD : string = "GET";
    private DOMAIN : string = "https://api-gateway.coupang.com/v2/providers/affiliate_open_api/apis/openapi/v1"
    private URL : string = "/v2/providers/affiliate_open_api/apis/openapi/"
    private ACCESS_KEY : string = DEFINES.KEYS.ACCESS_KEY;
    private SECRET_KEY : string = DEFINES.KEYS.SECRET_KEY;
    private REQUEST : {} = { "coupangUrls": [
        "https://www.coupang.com/np/search?component=&q=good&channel=user", 
        "https://www.coupang.com/np/coupangglobal"
    ]};

    constructor(){

    }

    async _sendRequest(url : string | null, method : Method | null, data? : any | null) : Promise<AxiosResponse | AxiosError> {
        var exactURL = this.DOMAIN + url;
        let someKey = await DataManager.getInstance().getKey(method,url);

        try {       
            const response = await axios.request({
                method: !!method ? method :this.REQUEST_METHOD,
                url: !!url ? exactURL :this.URL,
                headers: { Authorization: someKey }
                // data: !!data ? data : null
            });
            console.log(response.data);

            return response;
        } catch (err) {
            console.log(JSON.stringify(err.response.data));
            return new AxiosError(err);
        }    
    }

    async getBestProduct(category : number) : Promise<any>{
        const url = `/products/bestcategories/${category}`;
        const method = "GET";

        return this.getProductData(url,method);
    }

    async getProductData(url : string, method : Method){
        this._sendRequest(url,method,null)
        .then(()=>{
            console.log("FETCHING DATA END");
        })
    }
}

export default Data;