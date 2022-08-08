import { By, Key } from "selenium-webdriver";
import App from "../..";
import Util from "../util";

class ContentMaker {
    private _data : SearchProductData = null!;
    private _title : string = null!;
    private _contents : string = null!;

    constructor(data : SearchProductData){
        this._data = data;
    }

    public makeContent() : Promise<void> {
        this._title = this._data.productName + " 구매 후기!";

        return this.getContent().then(contents=>{
            this._contents = contents;
        })
    }

    public getContent() : Promise<string> {
        let content = '';

        return App.driver.get(this._data.productUrl).then(()=>{
            return this.generateFirstSection().then((sec)=>{
                content += sec;
                return Promise.resolve()
            })
            .then(()=>{
                return this.getReview();
            })
            .then((cont)=>{
                content += cont;
                return Promise.resolve(content);
            })
            .then((content)=>{
                return App.driver.switchTo().window(App.getTabName(0))
                .then(()=>{
                    return content
                });
            })
        })
    }

    private generateFirstSection() : Promise<any> {
        const content = `안녕하세요. 오늘은 ${this._data.productName} 에 대해 구매 후기를 작성해보려고 합니다...!\n`;
        return Promise.resolve(content);
    }

    private getReview() : Promise<string> {
        return this.makeNewTab()
        .then(()=>{
            return Util.getInstance().putDelay<string>(3000,this.findReviewElement,this);
        })
    }

    private makeNewTab() : Promise<void>{
        return App.driver.executeScript(`window.open('${this._data.productUrl}')`)
        .then(()=>{
            return App.addCurrentTab();
        })
        ;
    }

    private findReviewElement() : Promise<string>{
        let reviews : string = '';
        return App.driver.manage().deleteAllCookies().then(()=>{
            return App.driver.executeScript("window.scrollTo(0, document.body.scrollHeight)").then(()=>{
                return App.driver.findElements(By.className("sdp-review__article__list__review__content"))
                .then((elems)=>{
                    for(var i=0; i<elems.length; i++){
                        reviews += '\n' + elems[i].getAttribute('innerText');
                    }
                    return Promise.resolve(reviews);
                })
            })
        })
    }
}

export default ContentMaker;