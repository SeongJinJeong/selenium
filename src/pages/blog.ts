import App from '../../index';
import DEFINES from '../../defines/defines';
import { By, WebElement } from 'selenium-webdriver';

import Util from "../util";
import Data from "../data/index"

class Blog {
    private _dataManager : Data = null!;
    constructor(){
        this._dataManager = new Data();
    }

    run() : Promise<void>{
        console.log("Blog Started!");
        return this.getWritePage()
        .then(()=>{
            return Util.getInstance().putDelay(5000,this.switchToIFrame,this);
        })
        .then(()=>{
            return Util.getInstance().putDelay(2000,this.clickHelpCloseButton,this);
        })
        .then(()=>{
            return Util.getInstance().putDelay(2000,this.clickTitle,this);
        })
        .then(()=>{
            return this.getDataTest();
        })
        .then(()=>{
            // return this._dataManager.getBestProduct(1016);
        })
    }

    getWritePage() : Promise<void>{
        return App.driver.get(DEFINES.PAGE_URL.BLOG_WRITE);
    }

    switchToIFrame() : Promise<void> {
        return App.driver.findElement(By.name("mainFrame")).then((frame)=>{
            console.log("Switch iFrame : ",JSON.stringify(frame));
            return App.driver.switchTo().frame(frame);
        })
    }

    
    clickHelpCloseButton() : Promise<void>{
        let elem : WebElement = null!;
        return App.driver.findElement(By.className("se-help-panel-close-button"))
        .then((e)=>{
            elem = e;
            console.log("ClickHelpCloseButton : ",elem);
            e.click();
        })
    }

    clickTitle() : Promise<void>{
        const elem : WebElement = null!;
        const xPath : string = "//span[contains(.,'제목')]";
        return App.driver.findElement(By.xpath(xPath))
        .then((element)=>{
            var elem = element;
            return elem.click();
        })
    }

    getDataTest() : void {
        this._dataManager.getSearchData(DEFINES.PRODUCT_URL_GET.SEARCH.URL,"GET","65인치 티비",10)
        .then((res)=>{
            console.log(`getDataTest Function Call : ${JSON.stringify(res.data)}`);
        })
        .catch((err)=>{
            console.log(`Rejected By ${JSON.stringify(err)}`);
        })
    }
}

export default Blog;