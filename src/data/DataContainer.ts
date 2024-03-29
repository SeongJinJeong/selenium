import App from "../..";
import DEFINES from "../../defines/defines";
import DataManager from "./DataManager";

class DataContainer {
    private _productDataArr : SearchProductData[] = [];
    private _currentData : SearchProductData = null!;

    private _serachKeywords : string[] = [];
    private _currentKeyword : string = null!;

    private static _dataContainer : DataContainer = new DataContainer();
    public static getInstance(){
        if(!this._dataContainer) this._dataContainer = new DataContainer();

        return this._dataContainer;
    }

    constructor(){
        this.resetSearchKeywords();
    }

    private killProcess() : void{
        App.killProcess = true;
    }

    public resetSearchKeywords() : void {
        const keywords = DEFINES.SEARCH_KEYWORDS;
        this._serachKeywords = [...keywords];
    }

    public getSearchKeyword() : string {
        if(this._serachKeywords.length < 1) {
            // this.resetSearchKeywords();
            console.log("\n\n\n\n\n All Keywords Executed!! \n\n\n\n\n");
            this.killProcess();
            throw new Error("ALL PROCESS FINISH");
        }

        const index = Math.floor(Math.random() * this._serachKeywords.length);
        const keyword = this._serachKeywords[index];

        this._serachKeywords[index] = this._serachKeywords[0];
        this._serachKeywords[0] = null;
        this._serachKeywords.shift();

        this._currentKeyword = keyword;

        return keyword;
    }

    public async getNewData() : Promise<SearchProductData> {
        if(this._productDataArr.length < 1){
            await this.initData();
        }

        this._currentData = this._productDataArr.shift();
        return this._currentData;
    }

    public getCurrentData() : SearchProductData {
        return this._currentData;
    }

    public async initData() : Promise<void> {
        var keyword = this.getSearchKeyword();
        const data : AxiosSearchResponse | any = await DataManager.getInstance().getSearchData(DEFINES.PRODUCT_URL_GET.SEARCH,"GET",keyword,10);
        this._productDataArr = data.data.productData;
        console.log("\n\n\n Get Product Data Finish : \n"+JSON.stringify(this._productDataArr));
    }
}

export default DataContainer;