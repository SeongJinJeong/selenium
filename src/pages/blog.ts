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

    async run() : Promise<void>{
        console.log("Blog Started!");
        try {
            await this.getWritePage();
            await Util.getInstance().putDelay(5000,this.checkExistContent,this);
            await Util.getInstance().putDelay(2000,this.switchToIFrame,this);
            await Util.getInstance().putDelay(2000,this.clickHelpCloseButton,this);
            await Util.getInstance().putDelay(2000,this.clickTitle,this);
            await this.writeTitle();
            await Util.getInstance().putDelay<void>(3000,this.writeContent,this);
            await this.addImages();
            await Util.getInstance().putDelay<void>(3000,this.submitContent,this);
        } catch (err) {
            console.log(err);
        }
    }

    async getWritePage() : Promise<void>{
        await App.driver.get(DEFINES.PAGE_URL.BLOG_WRITE);
    }

    async checkExistContent() : Promise<void> {
        const elems = await App.driver.findElements(By.className("se-popup-button-cancel"))
        if(elems.length > 0){
            await elems[0].click();
        }
    }

    async switchToIFrame() : Promise<void> {
        const frame = await App.driver.findElement(By.name("mainFrame"))
        console.log("Switch iFrame : ",JSON.stringify(frame));
        
        await App.driver.switchTo().frame(frame);
    }

    
    async clickHelpCloseButton() : Promise<void>{
        let elem : WebElement = null!;
        const e = await App.driver.findElements(By.className("se-help-panel-close-button"))
        if(e.length < 1){
            return Promise.resolve();
        }
        elem = e[0];
        console.log("ClickHelpCloseButton : ",elem);
        await e[0].click();
    }

    async clickTitle() : Promise<void>{
        const xPath : string = "//span[contains(.,'제목')]";
        const element = await App.driver.findElement(By.xpath(xPath))
        this._title = element;
        await this._title.click();
    }

    async writeTitle() : Promise<void>{
        const title = await App.ContentMaker.getTitle();
        await App.driver.actions().sendKeys( title ).perform();
    }

    async writeContent() : Promise<void>{
        const content = await App.ContentMaker.getContent();
        await App.driver.actions().sendKeys(Key.ENTER).perform()
        const productData = await App.ContentMaker.getProductData();
        await Util.getInstance().putDelay(1000,this.sendProductImageKey.bind(this,productData.productImage),this);
        await Util.getInstance().putDelay<void>(3000,function(){
            return App.driver.actions().sendKeys( content ).perform();
        },this);
        await this.addCoupangLink();
    }

    private async addImageProcess(url : string) : Promise<void> {
        await this.clickLinkImageButton();
        await Util.getInstance().putDelay(1000,this.inputImageUrl.bind(this,url),this);
        await Util.getInstance().putDelay(1000,this.clickUrlSearchButton,this);
        await Util.getInstance().putDelay(3000,this.clickImageLinkConfirm,this);
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

    private async clickLinkImageButton() : Promise<void> {
        const elem = await App.driver.findElement(By.className("se-oglink-toolbar-button"))
        await elem.click();
    }

    private async clickImageUrlInput() : Promise<void> {
        const elem = await App.driver.findElement(By.className("se-popup-oglink-input"));
        await elem.click();
    }

    private async inputImageUrl(url? : string) : Promise<void> {
        let imageUrl = "";
        
        if(!!url) imageUrl = url;
        else {
            do{
                imageUrl = App.ContentMaker.getProductImage();
            } while (!imageUrl)
        }
        
        await App.driver.actions().sendKeys(imageUrl).perform();
    }

    private async clickUrlSearchButton() : Promise<void> {
        const elem = await App.driver.findElement(By.className("se-popup-oglink-button"));
        await elem.click();
    }

    private async clickImageLinkConfirm() : Promise<void> {
        const elem = await App.driver.findElement(By.className("se-popup-button-confirm"));
        await elem.click();
    }

    async addCoupangLink() : Promise<void>{
        const productData = await App.ContentMaker.getProductData()
        await Util.getInstance().putDelay(1000,this.sendProductUrlKey.bind(this,productData.productUrl),this);
        await Util.getInstance().putDelay(1000,this.sendProductImageKey.bind(this,productData.productImage),this);
        await Util.getInstance().putDelay(1000,this.sendDescKey.bind(this,"파트너스 활동을 통해 일정액의 수수료를 제공받을 수 있음"),this);
    }

    async sendProductUrlKey(url : string) : Promise<void>{
        await App.driver.actions().sendKeys("\n\n"+url).perform();
    }

    async sendProductImageKey(url : string) : Promise<void>{
        await this.addImageProcess(url);
    }

    async sendDescKey(desc : string) : Promise<void>{
        await App.driver.actions().sendKeys("\n\n"+desc).perform();
    }

    async submitContent() : Promise<void>{
        const button1 = await App.driver.findElement(By.xpath("//div[@id='root']/div/div/div/div[3]/div[3]/button/span"))
        await button1.click();
        const tagInput = await App.driver.findElement(By.id("tag-input"))
        await tagInput.click()
        await tagInput.sendKeys(DataContainer.getInstance().getCurrentData().keyword);
        const button = await App.driver.findElement(By.xpath("//div[@id='root']/div/div/div/div[3]/div[3]/div/div/div/div[8]/div/button"))
        await button.click();
    }
}

export default Blog;