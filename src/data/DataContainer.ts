class DataContainer {
    private _productData : {[key : string] : SearchProductData[]} = {};
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
            "일렉 기타"
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

    public addData(data:SearchProductData){
        console.log(`\n\n\n Data Container Add Data : \n keyword - ${this._currentKeyword} \n data - ${JSON.stringify(data)}`);
        if(Array.isArray(this._productData[this._currentKeyword])){
            this._productData[this._currentKeyword].push(data);
        } else {
            this._productData[this._currentKeyword] = [data];
        }
    }

    public getNewProductData() : SearchProductData {
        console.log("DEBUG TEST !!!!");
        this._currentData = this._productData[this._currentKeyword].shift();
        return this._currentData;
    }

    public getCurrentData() : SearchProductData {
        return this._currentData;
    }
}

export default DataContainer;