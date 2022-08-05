import axios, { Axios, AxiosError, AxiosResponse, Method } from "axios";
import DEFINES from "../../defines/defines";
import KeyGenerator from "./hmacGenerator"
import DataManager from "./DataManager"

class Data {
    private _insertUrl : string = "/v2/providers/affiliate_open_api/apis/openapi/v1";

    constructor(){

    }

    async _sendRequest(url : string | null, method : Method | null, data? : any | null) : Promise<AxiosResponse<any> | AxiosError> {
        axios.defaults.baseURL = "https://api-gateway.coupang.com";
        const exactUrl = this._insertUrl + url;
        let someKey = await DataManager.getInstance().getKey(method,exactUrl);
        console.log(someKey);

        if(method.toLowerCase() === "post"){
            try {       
                if(!data)
                    throw new Error("Param Data is not exist!");

                const response = await axios.request({
                    method: method,
                    url: exactUrl,
                    headers: { Authorization: someKey },
                    data : data
                });
                console.log(response.data);
    
                return response;
            } catch (err) {
                console.log(JSON.stringify(err.response.data));
                Promise.reject(new AxiosError(err));
            }        
        } else {
            try {       
                const response = await axios.request({
                    method: method,
                    url: exactUrl,
                    headers: { Authorization: someKey },
                });
                console.log(response);
    
                return response;
            } catch (err) {
                console.log(JSON.stringify(err));
                Promise.reject(new AxiosError(err));
            }
        }    
    }

    async sendTestRequest(){
        let someKey = await DataManager.getInstance().getKey("POST","/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink");
        axios.defaults.baseURL = "https://api-gateway.coupang.com";

        try {       
            const response = await axios.request({
                method: "POST",
                url: "/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink",
                headers: { Authorization: someKey },
                data: { "coupangUrls": [
                    "https://www.coupang.com/np/search?component=&q=good&channel=user", 
                    "https://www.coupang.com/np/coupangglobal"
                ]}
            });
            console.log(response.data);
        } catch (err) {
            console.error(err.response.data);
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

    async getSearchData(url : string, method : Method, keyword : string, limit : number) : Promise<any>{
        let exactUrl = `${url}?keyword=${encodeURIComponent(keyword)}&limit=${limit}`;
        return this._sendRequest(exactUrl,method,null)
        .then((res)=>{
            return Promise.resolve(res);
        })
        .catch((err)=>{
            console.log(`Getting Search Error : ${err}`)
            return Promise.reject(err);
        })
    }
}

export default Data;