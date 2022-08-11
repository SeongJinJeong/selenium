import { By, Key, WebElement } from "selenium-webdriver";
import { elementsLocated } from "selenium-webdriver/lib/until";
import App from "../..";
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

    // INIT
    public run() : Promise<void> {
        return DataContainer.getInstance().initData()
            .then(()=>{
                return DataContainer.getInstance().getNewData();
            })
            .then((data)=>{
                this._data = data;
                return Promise.resolve();
            })
            .then(()=>{
                return this.makeTitle();
            })
            .then(()=>{
                return this.gotoCoupangPage();
            })
            .then(()=>{
                return Util.getInstance().putDelay(3000,this.clickReviewTab,this);
            })
            .then(()=>{
                return Util.getInstance().putDelay(3000,this.getReviewImages,this);
            })
            .then(()=>{
                return Util.getInstance().putDelay(3000,this.getReviewArticles,this);
            })
            .then(()=>{
                console.log(`\n\n\n Content Maker Finish : \nTitle : ${JSON.stringify(this._title)} \nContent : ${JSON.stringify(this._contents)}`);
                return Promise.resolve();
            })
    }

    private makeTitle() : Promise<void>{
        this._title = this._data.productName + " 구매 후기!";
        return Promise.resolve();
    }

    private gotoCoupangPage() : Promise<void> {
        return App.driver.get(this._data.productUrl);
    }

    private clickReviewTab() : Promise<void> {
        return App.driver.findElement(By.xpath("//div[@id='btfTab']/ul/li[2]")).then((elem)=>{
            return elem.click();
        })
    }

    private getReviewImages() : Promise<void> {
        return App.driver.findElements(By.className("js_reviewListGalleryImage")).then( async elems=>{
            for(let i=0; i<elems.length; i++){
                await this.setImageStrings(elems[i]);
            }
        })
    }

    private async setImageStrings(elem : WebElement) : Promise<void>{
        this._images.push(await elem.getAttribute("src"));
    }

    private getReviewArticles() : Promise<void> {
        return App.driver.findElements(By.className("sdp-review__article__list__review__content")).then((elems)=>{
            if(elems.length < 1)
                return Promise.resolve();

            return this.setArticles(elems);
        });
    }

    private async setArticles(elems : WebElement[]) : Promise<void>{
        for(var i=0; i<elems.length; i++){
            await this.runPapago(elems[i]);
        }
    }

    private async runPapago(elem: WebElement) : Promise<void>{
        let text = await elem.getText();
        this._contents += await Papago.getInstance().runCrawling(text);
        return;
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