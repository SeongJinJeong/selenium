import App from '../../index';
import DEFINES from '../../defines/defines';
import { By, WebElement } from 'selenium-webdriver';

import Util from "../util";
import Data from "../data/index"
import { AxiosResponse } from 'axios';

import DataContainer from "../data/DataContainer";

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
            console.log(`\n\n\n Get Random Product Result : \n${JSON.stringify(DataContainer.getInstance().getProductData())}`);
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

    getDataTest() : Promise<any> {
        var keyword = DataContainer.getInstance().getSearchKeyword();
        return this._dataManager.getSearchData(DEFINES.PRODUCT_URL_GET.SEARCH.URL,"GET",keyword,10)
        .then((res : AxiosResponse<AxiosSearchResponse,any>)=>{
            console.log(`getDataTest Function Call : ${JSON.stringify(res.data)}`);
            console.log(`\n\n\n Data Length : ${res.data.data.productData.length}`);
            
            for(var i=0; i<res.data.data.productData.length; i++){
                DataContainer.getInstance().addData(res.data.data.productData[i]);
            }
            // res.data.data.productData.forEach((product)=>{
            //     DataContainer.getInstance().addData(product);
            // })
            return Promise.resolve();
        })
        .then(()=>{
            App.driver.quit();
        })
        .catch((err)=>{
            console.log(`Rejected By ${JSON.stringify(err)}`);
        })
    }
}

export default Blog;