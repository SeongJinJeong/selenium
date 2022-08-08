import App from '../../index';
import DEFINES from '../../defines/defines';
import { By, WebElement, Actions, Key } from 'selenium-webdriver';

import Util from "../util";
import DataManager from "../data/DataManager"
import { AxiosResponse } from 'axios';

import DataContainer from "../data/DataContainer";
import ContentMaker from "../contentMaker/contentMaker";
import Login from './Login';

class Blog {
    private _dataManager : DataManager = null!;

    private _title : WebElement = null!;
    private _content : WebElement = null!;

    constructor(){
        this._dataManager = new DataManager();
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
            return this.writeTitle();
        })
        .then(()=>{
            return Util.getInstance().putDelay<void>(3000,this.writeContent,this);
        })
        .then(()=>{
            return this.addCoupangLink();
        })
        .then(()=>{
            return Util.getInstance().putDelay<void>(3000,this.submitContent,this);
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

    writeTitle() : Promise<void>{
        return App.ContentMaker.getTitle().then((title)=>{
            return App.driver.actions().sendKeys( title ).perform();
        })
        
    }

    writeContent() : Promise<void>{
        return App.ContentMaker.getContent().then((content)=>{
            return App.driver.actions().sendKeys(Key.ENTER).perform()
                .then(()=>{
                    return App.driver.actions().sendKeys( content ).perform();
                })
        })
    }

    addCoupangLink() : Promise<void>{
        return App.ContentMaker.getProductData().then((productData)=>{
            return App.driver.actions()
            .sendKeys("\n\n" + productData.productUrl)
            .sendKeys("\n\n" + productData.productImage)
            .sendKeys("\n\n" + "파트너스 활동을 통해 일정액의 수수료를 제공받을 수 있음")
            .perform();
        })
    }

    submitContent() : Promise<void>{
        return App.driver.findElement(By.xpath("//div[@id='root']/div/div/div/div[3]/div[3]/button/span"))
        .then((button)=>{
            return button.click()
        })
        .then(()=>{
            return App.driver.findElement(By.id("tag-input"))
        })
        .then((tagInput)=>{
            return tagInput.click().then(()=>{return tagInput.sendKeys(DataContainer.getInstance().getCurrentData().keyword)});
        })
        .then(()=>{
            return App.driver.findElement(By.xpath("//div[@id='root']/div/div/div/div[3]/div[3]/div/div/div/div[8]/div/button"))
        })
        .then((button)=>{
            return button.click();
        })
    }
}

export default Blog;