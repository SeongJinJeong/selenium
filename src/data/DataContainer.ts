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

    public resetSearchKeywords() : void {
        const keywords = [
            "65인치 티비",
            "세탁기",
            "냉장고",
            "대형 가전",
            "아이폰 13",
            "갤럭시 폴드",
            "에어컨",
            "일렉 기타",
            "맥북",
            "삼성 노트북",
            "LG 그램",
            "커세어 키보드",
            "스타일러",
        ]
        this._serachKeywords = [...keywords];
    }

    public getSearchKeyword() : string {
        if(this._serachKeywords.length < 1) {
            this.resetSearchKeywords();
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

    public initData() : Promise<void> {
        var keyword = this.getSearchKeyword();
        return DataManager.getInstance().getSearchData(DEFINES.PRODUCT_URL_GET.SEARCH,"GET",keyword,10).then((data : AxiosSearchResponse)=>{
            this._productDataArr = data.data.productData;
            console.log("\n\n\n Get Product Data Finish : \n"+JSON.stringify(this._productDataArr));
        })
    }
}

export default DataContainer;