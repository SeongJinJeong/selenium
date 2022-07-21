import axios, { AxiosResponse, Method } from "axios";
import DEFINES from "../../defines/defines";
import KeyGenerator from "./hmacGenerator"

class Data {
    private _keyGen : KeyGenerator = null!;

    private REQUEST_METHOD : string = "GET";
    private DOMAIN : string = "https://api-gateway.coupang.com"
    private URL : string = "/v2/providers/affiliate_open_api/apis/openapi/"
    private ACCESS_KEY : string = DEFINES.KEYS.ACCESS_KEY;
    private SECRET_KEY : string = DEFINES.KEYS.SECRET_KEY;
    private REQUEST : {} = { "coupangUrls": [
        "https://www.coupang.com/np/search?component=&q=good&channel=user", 
        "https://www.coupang.com/np/coupangglobal"
    ]};

    constructor(){
        this._keyGen = new KeyGenerator(this.REQUEST_METHOD,this.URL,this.SECRET_KEY,this.ACCESS_KEY);
    }

    async testCoupangRequest() : Promise<AxiosResponse> {
        let authorization : string = null!;
        return this._keyGen._generateKey().then((key)=>{
            return Promise.resolve(key);
        })
        .then((key)=>{
            return this._sendRequest(key,null,null,'POST');
        })
    }

    async _sendRequest(key : string, url? : string, data? : any, method? : Method) : Promise<AxiosResponse> {
        axios.defaults.baseURL = this.DOMAIN;

        try {       
            const response = await axios.request({
                method: !!method ? method :this.REQUEST_METHOD,
                url: !!url ? url :this.URL,
                headers: { Authorization: key },
                data: !!data ? data : this.REQUEST
            });
            console.log(response.data);

            return response;
        } catch (err) {
            console.log(JSON.stringify(err.response.data));
        }    
    }

    async getBestProduct(category : number) : Promise<any>{
        const url = `https://api-gateway.coupang.com/v2/providers/affiliate_open_api/apis/openapi/products/bestcategories/${category}?limit=50`;

        return this.getProductData(url);
    }

    async getProductData(url : string){
        const key = "";
        return this._keyGen._generateKey().then((key)=>{
            return Promise.resolve(key);
        })
        .then((key)=>{
            return this._sendRequest(key,url,null,'GET');
        })
    }
}

export default Data;