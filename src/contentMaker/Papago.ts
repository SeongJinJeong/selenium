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
    public runAPIFetching(kor : string):Promise<string>{
        return this.requestTranslateToEnglish(kor).then((eng)=>{
            return this.requestTranslateToKorean(eng);
        })
    }

    public requestTranslateToEnglish(text : string) : Promise<string> {
        const queryString = qs.stringify({
            source : "ko",
            target : "en",
            text : text
        })

        return this.requestTranslate(queryString)
    }

    public requestTranslateToKorean(text : string) : Promise<string> {
        const queryString = qs.stringify({
            source : "en",
            target : "ko",
            text : text
        })

        return this.requestTranslate(queryString)
    }

    private requestTranslate(queryString : string) : Promise<string> {

        axios.defaults.baseURL = "";

        const options : AxiosRequestConfig = {
            headers : {
                "X-Naver-Client-ID" : DEFINES.PAPAGO_AUTH["X-Naver-Client-ID"],
                "X-Naver-Client-Secret" : DEFINES.PAPAGO_AUTH["X-Naver-Client-Secret"],
                "Content-Type" : "application/x-www-form-urlencoded; charset=UTF-8"
            }
        }

        const url : string = this.baseUrl;

        return new Promise((resolve,reject)=>{
            axios.post(url,queryString,options).then((res : AxiosResponse<AxiosPapagoResponse>)=>{
                resolve(res.data.message.result.translatedText);
            }).catch(err=>{
                reject(err);
            });
        })
    }

    // Crawling From Papago Page
    private openNewTab() : Promise<void>{
        return App.driver.executeScript('window.open()').then(()=>{
            let tabName = '';
            return App.driver.getAllWindowHandles().then(arr=>{
                tabName = arr[1];
                return App.driver.switchTo().window(tabName)
                .then(()=>{
                    return App.addCurrentTab();
                })
            })
        })
    }

    private getTranslatePage() : Promise<void> {
        return App.driver.get('https://papago.naver.com/');
    }

    private getTextInput() : Promise<void>{
        return App.driver.findElement(By.id("sourceEditArea")).then((elem)=>{
            return elem.click();
        })
    }

    private inputText(text: string) : Promise<void> {
        return App.driver.actions().sendKeys(text).perform();
    }

    private getEnglishTarget() : Promise<void> {
        return App.driver.findElement(By.id("txtTarget")).then((elem)=>{
            return elem.getText().then((text)=>{
                this.englishText = text;
            });
        })
    }

    private clearInput() : Promise<void> {
        return App.driver.findElement(By.name("txtSource")).then((elem)=>{
            const element = elem;
            return elem.clear().then(()=>{
                return element.click();
            })
        })
    }

    private inputEnglishText() : Promise<void> {
        return App.driver.actions().sendKeys(this.englishText).perform();
    }

    private async getKoreanTarget() : Promise<string> {
        return App.driver.findElement(By.id("txtTarget")).then((elem)=>{
            let text = '';
            return elem.getText().then((txt)=>{
                text = txt;
                return Promise.resolve(text);
            })
        })
    }

    private closeCurrentTab() : Promise<void> {
        return App.driver.executeScript('window.close()').then(()=>{
            App.removeLastTab();
            return App.driver.switchTo().window(App.getTabName(0))
        })
    }

    private clickTranslate() : Promise<void> {
        return App.driver.findElement(By.id("btnTranslate")).then((elem)=>{
            return elem.click();
        })
    }

    public runCrawling(text : string) : Promise<string | void>{
        return this.openNewTab()
        .then(()=>{
            return this.getTranslatePage()
        })
        .then(()=>{
            return Util.getInstance().putDelay(3000,this.getTextInput,this);
        })
        .then(()=>{
            return this.inputText(text);
        })
        .then(()=>{
            return Util.getInstance().putDelay(3000,this.clickTranslate,this);
        })
        .then(()=>{
            return Util.getInstance().putDelay(3000,this.getEnglishTarget,this);
        })
        .then(()=>{
            return Util.getInstance().putDelay(3000,this.clearInput,this);
        })
        .then(()=>{
            return this.inputEnglishText();
        })
        .then(()=>{
            return Util.getInstance().putDelay(3000,this.clickTranslate,this);
        })
        .then(()=>{
            return Util.getInstance().putDelay<string>(5000,this.getKoreanTarget,this).then((string)=>{
                return Util.getInstance().putDelay(3000,this.closeCurrentTab,this).then(()=>{
                    return Promise.resolve(string);
                })
            })
        })
        .catch(err=>{
            console.log(err);
        })
    }
}

export default Papago;