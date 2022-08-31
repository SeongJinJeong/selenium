import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { KeyObject } from "crypto";
import * as qs from "query-string";
import DEFINES from "../../defines/defines";
import App from "../..";
import { By } from "selenium-webdriver";
import Util from "../util";

class Papago {
    private baseUrl : string = "https://openapi.naver.com/v1/papago/n2mt";
    private englishText : string = "";

    private static Papago : Papago;
    public static getInstance(){
        if(!this.Papago) {
            this.Papago = new Papago();
        }

        return this.Papago;
    }

    constructor(){

    }

    // Data Fetching From Papago API
    public async runAPIFetching(kor : string):Promise<string>{
        const eng = await this.requestTranslateToEnglish(kor);
        return await this.requestTranslateToKorean(eng);
    }

    public async requestTranslateToEnglish(text : string) : Promise<string> {
        const queryString = qs.stringify({
            source : "ko",
            target : "en",
            text : text
        })

        return await this.requestTranslate(queryString)
    }

    public async requestTranslateToKorean(text : string) : Promise<string> {
        const queryString = qs.stringify({
            source : "en",
            target : "ko",
            text : text
        })

        return await this.requestTranslate(queryString)
    }

    private async requestTranslate(queryString : string) : Promise<string> {

        axios.defaults.baseURL = "";

        const options : AxiosRequestConfig = {
            headers : {
                "X-Naver-Client-ID" : DEFINES.PAPAGO_AUTH["X-Naver-Client-ID"],
                "X-Naver-Client-Secret" : DEFINES.PAPAGO_AUTH["X-Naver-Client-Secret"],
                "Content-Type" : "application/x-www-form-urlencoded; charset=UTF-8"
            }
        }

        const url : string = this.baseUrl;

        const res = await axios.post(url,queryString,options);
        return res.data.message.result.translatedText;

        // return new Promise((resolve,reject)=>{
        //     axios.post(url,queryString,options).then((res : AxiosResponse<AxiosPapagoResponse>)=>{
        //         resolve(res.data.message.result.translatedText);
        //     }).catch(err=>{
        //         reject(err);
        //     });
        // })
    }

    // Crawling From Papago Page
    private async openNewTab() : Promise<void>{
        await App.driver.executeScript('window.open()')
        let tabName = '';
        const arr = await App.driver.getAllWindowHandles();
        tabName = arr[1];
        await App.driver.switchTo().window(tabName)
        await App.addCurrentTab();
    }

    private async getTranslatePage() : Promise<void> {
        await App.driver.get('https://papago.naver.com/');
    }

    private async getTextInput() : Promise<void>{
        const elem = await App.driver.findElement(By.id("sourceEditArea"))
        await elem.click();
    }

    private async inputText(text: string) : Promise<void> {
        await App.driver.actions().sendKeys(text).perform();
    }

    private async getEnglishTarget() : Promise<void> {
        const elem = await App.driver.findElement(By.id("txtTarget"));
        const text = await elem.getText();
        this.englishText = text;
    }

    private async clearInput() : Promise<void> {
        const elem = await App.driver.findElement(By.name("txtSource"));
        const element = elem;
        await elem.clear()
        await element.click();
    }

    private async inputEnglishText() : Promise<void> {
        await App.driver.actions().sendKeys(this.englishText).perform();
    }

    private async getKoreanTarget() : Promise<string> {
        const elem = await App.driver.findElement(By.id("txtTarget"))
        let text = '';
        const txt = await elem.getText()
        text = txt;
        return text;
    }

    private async closeCurrentTab() : Promise<void> {
        await App.driver.executeScript('window.close()');
        App.removeLastTab();
        await App.driver.switchTo().window(App.getTabName(0))
    }

    private async clickTranslate() : Promise<void> {
        const elem = await App.driver.findElement(By.id("btnTranslate"))
        await elem.click();
    }

    private async clickBannerClose() : Promise<void> {
        const elem = await App.driver.findElements(By.className("evt_close___2B5rg"))
        if(elem.length > 0){
            elem[0].click();
        }
    }

    public async runCrawling(text : string) : Promise<string | void>{
        try {
            await this.openNewTab()
            await this.getTranslatePage()
            await Util.getInstance().putDelay(3000,this.clickBannerClose,this);
            await Util.getInstance().putDelay(3000,this.getTextInput,this);
            await this.inputText(text);
            await Util.getInstance().putDelay(3000,this.clickTranslate,this);
            await Util.getInstance().putDelay(3000,this.getEnglishTarget,this);
            await Util.getInstance().putDelay(3000,this.clearInput,this);
            await this.inputEnglishText();
            await Util.getInstance().putDelay(3000,this.clickTranslate,this);
            const string = await Util.getInstance().putDelay<string>(5000,this.getKoreanTarget,this);
            await Util.getInstance().putDelay(3000,this.closeCurrentTab,this)
            return string;
        } catch(err){
            console.log(err);
        }
    }
}

export default Papago;