import App from '../../index';
import DEFINES from '../../defines/defines';
import { By, WebElement, Actions, Key } from 'selenium-webdriver';

import Util from "../util";
import Data from "../data/index"
import { AxiosResponse } from 'axios';

import DataContainer from "../data/DataContainer";
import ContentMaker from "../contentMaker/contentMaker";

class Blog {
    private _dataManager : Data = null!;

    private _title : WebElement = null!;
    private _content : WebElement = null!;

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
            return this.writeTitle();
        })
        .then(()=>{
            return this.getReviews();
        })
        .then((content)=>{
            return this.writeContent(content);
        })
        .catch(console.error);
    }

    getWritePage() : Promise<void>{
        return App.driver.get(DEFINES.PAGE_URL.BLOG_WRITE).then(()=>{
            return App.addCurrentTab();
        });
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
        const xPath : string = "//span[contains(.,'제목')]";
        return App.driver.findElement(By.xpath(xPath))
        .then((element)=>{
            this._title = element;
            return this._title.click();
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
        .catch((err)=>{
            console.log(`Rejected By ${JSON.stringify(err)}`);
        })
    }

    writeTitle() : Promise<void>{
        const data : SearchProductData = DataContainer.getInstance().getNewProductData();
        const titleName : string = data.productName + " 구매 후기!";

    
        return App.driver.actions().sendKeys(titleName).perform()
    }

    getReviews() : Promise<string> {
        let contentMaker = new ContentMaker(DataContainer.getInstance().getCurrentData());
        return contentMaker.getContent()
    }

    writeContent(content : string) : Promise<any>{
        const data = DataContainer.getInstance().getCurrentData();

        return App.driver.findElement(By.xpath("//span[contains(.,'본문에 #을 이용하여 태그를 사용해보세요! (최대 30개)')]"))
        .then((elem)=>{
            this._content = elem;
            return this._content.click();
        })
        .then(()=>{
            App.driver.getWindowHandle().then((any)=>{
                console.log(JSON.stringify(any));
            })
        })
    }
}

export default Blog;    