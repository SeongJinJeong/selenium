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
            return Util.getInstance().putDelay(5000,this.checkExistContent,this);
        })
        .then(()=>{
            return Util.getInstance().putDelay(2000,this.switchToIFrame,this);
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
            return this.addImages();
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
        return App.driver.get(DEFINES.PAGE_URL.BLOG_WRITE);
    }

    checkExistContent() : Promise<void> {
        return App.driver.findElements(By.className("se-popup-button-cancel")).then((elems)=>{
            if(elems.length > 0){
                return elems[0].click();
            } else {
                return Promise.resolve();
            }
        })
    }

    switchToIFrame() : Promise<void> {
        return App.driver.findElement(By.name("mainFrame")).then((frame)=>{
            console.log("Switch iFrame : ",JSON.stringify(frame));
            return App.driver.switchTo().frame(frame);
        })
    }

    
    clickHelpCloseButton() : Promise<void>{
        let elem : WebElement = null!;
        return App.driver.findElements(By.className("se-help-panel-close-button"))
        .then((e)=>{
            if(e.length < 1){
                return Promise.resolve();
            }
            elem = e[0];
            console.log("ClickHelpCloseButton : ",elem);
            e[0].click();
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

    private async addImages() : Promise<void>{
        for(let i=0; i<App.ContentMaker.getProductImageArr().length; i++){
            await this.clickLinkImageButton()
            // await this.clickImageUrlInput();
            await Util.getInstance().putDelay(1000,this.inputImageUrl,this);
            await Util.getInstance().putDelay(1000,this.clickUrlSearchButton,this);
            await Util.getInstance().putDelay(3000,this.clickImageLinkConfirm,this);
        }
        return;
    }

    private clickLinkImageButton() : Promise<void> {
        return App.driver.findElement(By.className("se-oglink-toolbar-button")).then((elem)=>{
            return elem.click();
        })
    }

    private clickImageUrlInput() : Promise<void> {
        return App.driver.findElement(By.className("se-popup-oglink-input")).then((elem)=>{
            return elem.click();
        })
    }

    private inputImageUrl() : Promise<void> {
        let imageUrl = "";
        do{
            imageUrl = App.ContentMaker.getProductImage();
        } while (!imageUrl)

        return App.driver.actions().sendKeys(imageUrl).perform();
    }

    private clickUrlSearchButton() : Promise<void> {
        return App.driver.findElement(By.className("se-popup-oglink-button")).then((elem)=>{
            return elem.click();
        })
    }

    private clickImageLinkConfirm() : Promise<void> {
        return App.driver.findElement(By.className("se-popup-button-confirm")).then((elem)=>{
            return elem.click();
        })
    }

    addCoupangLink() : Promise<void>{
        return App.ContentMaker.getProductData().then( async (productData)=>{
            await Util.getInstance().putDelay(1000,this.sendProductUrlKey.bind(this,productData.productUrl),this);
            await Util.getInstance().putDelay(1000,this.sendProductImageKey.bind(this,productData.productImage),this);
            await Util.getInstance().putDelay(1000,this.sendDescKey.bind(this,"파트너스 활동을 통해 일정액의 수수료를 제공받을 수 있음"),this);
        })
    }

    sendProductUrlKey(url : string) : Promise<void>{
        return App.driver.actions().sendKeys("\n\n"+url).perform();
    }

    sendProductImageKey(url : string) : Promise<void>{
        return App.driver.actions().sendKeys("\n\n"+url).perform();
    }

    sendDescKey(desc : string) : Promise<void>{
        return App.driver.actions().sendKeys("\n\n"+desc).perform();
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