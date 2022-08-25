import { By, Key, WebElement } from "selenium-webdriver";
import { elementsLocated } from "selenium-webdriver/lib/until";
import App from "../..";
import DEFINES from "../../defines/defines";
import DataContainer from "../data/DataContainer";
import Util from "../util";
import Papago from "./Papago";

class ContentMaker {
    private _data : SearchProductData = null!;
    private _title : string = '';
    private _contents : string = "";
    private _images : string[] = [];

    constructor(){
        
    }

    reset() : void {
        this._data = null;
        this._title = '';
        this._contents = "";
        this._images = [];
    }

    // INIT
    public async run() : Promise<void> {
        try {
            await this.initData()    
            const data = await DataContainer.getInstance().getNewData();
            this._data = data;
            console.log(this._data.keyword);
            await this.makeTitle();
            await this.gotoCoupangPage();
            await Util.getInstance().putDelay(3000,this.clickReviewTab,this);
            await Util.getInstance().putDelay(3000,this.getReviewImages,this);            
            await Util.getInstance().putDelay(3000,this.getReviewArticles,this);    
            console.log(`\n\n\n Content Maker Finish : \nTitle : ${JSON.stringify(this._title)} \nContent : ${JSON.stringify(this._contents)}`);
        } catch(err){
            console.log(err);
        }
    }

    private async initData() : Promise<void> {
        if(!App.isRunning){
            await DataContainer.getInstance().initData(); 
        }
    }

    private async makeTitle() : Promise<void>{
        this._title = this._data.productName + " 구매 후기!";
    }

    private async gotoCoupangPage() : Promise<void> {
        await App.driver.get(this._data.productUrl);
    }

    private async clickReviewTab() : Promise<void> {
        const elems = await App.driver.findElements(By.xpath("//div[@id='btfTab']/ul/li[2]"))
        if(elems.length < 1){
            this.reset();
            await this.run();
        }
        await elems[0].click();
    }

    private async getReviewImages() : Promise<void | string> {
        const elems = await App.driver.findElements(By.className("js_reviewListGalleryImage"))
        if(elems.length < 1){
            return "\n\nNo Review Images!";
        }
        for(let i=0; i<elems.length; i++){
            await this.setImageStrings(elems[i]);
        }
    }

    private async setImageStrings(elem : WebElement) : Promise<void>{
        this._images.push(await elem.getAttribute("src"));
    }

    private async getReviewArticles() : Promise<void> {
        const elems = await App.driver.findElements(By.className("sdp-review__article__list__review__content"))
        if(elems.length < 1){
            this.reset();
            await this.run();
        }
        await this.setArticles(elems);
    }

    private async setArticles(elems : WebElement[]) : Promise<void>{
        for(var i=0; i<elems.length; i++){
            await this.runPapago(elems[i]);
        }
    }

    private async runPapago(elem: WebElement) : Promise<void>{
        let text = await elem.getText();
        this._contents += await Papago.getInstance().runCrawling(text);
    }

    // GETTER
    public getTitle() : Promise<string>{
        return Promise.resolve(this._title);
    }

    public getContent() : Promise<string> {
        return Promise.resolve(this._contents);
    }

    public getProductData() : Promise<SearchProductData> {
        return Promise.resolve(this._data);
    }

    public getProductImageArr() : string[] {
        return this._images;
    }

    public getProductImage() : string {
        return this._images.shift();
    }
}

export default ContentMaker;