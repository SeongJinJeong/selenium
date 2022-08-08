import { By, Key, WebElement } from "selenium-webdriver";
import App from "../..";
import DataContainer from "../data/DataContainer";
import Util from "../util";

class ContentMaker {
    private _data : SearchProductData = null!;
    private _title : string = '';
    private _contents : string = "";

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

    private getReviewArticles() : Promise<void> {
        return App.driver.findElements(By.className("sdp-review__article__list__review__content")).then((elems)=>{
            return this.setArticles(elems);
        });
    }

    private setArticles(elems : WebElement[]) : Promise<void>{
        // var arr = [];
        // return new Promise((resolve,reject)=>{
        //     for(var i=0; i<elems.length; i++){
        //         elems[i].getText().then((text)=>{
        //             this._contents += "\n\n"+text;
        //             arr.push(elems[i]);
        //         })
        //     }

        //     if(arr.length === elems.length) resolve();
        // })

        return new Promise((resolve,reject)=>{
            elems.forEach((elem,index)=>{
                elem.getText().then((string)=>{
                    this._contents += "\n\n"+string;
                    if(index === elems.length-1) resolve();
                })
            })
        })
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
}

export default ContentMaker;