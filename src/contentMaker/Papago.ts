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
            App.addCurrentTab();
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

    private getKoreanTarget() : Promise<string> {
        return App.driver.findElement(By.id("txtTarget")).then((elem)=>{
            return elem.getText()
        })
    }

    private closeCurrentTab() : Promise<void> {
        return App.driver.executeScript('window.close()').then(()=>{
            App.removeLastTab();
            Promise.resolve();
        })
    }

    public runCrawling(text : string) : Promise<string | void>{
        return this.getTranslatePage()
        .then(()=>{
            return Util.getInstance().putDelay(3000,this.getTextInput,this);
        })
        .then(()=>{
            return this.inputText(text);
        })
        .then(()=>{
            return this.getEnglishTarget();
        })
        .then(()=>{
            return Util.getInstance().putDelay(3000,this.clearInput,this);
        })
        .then(()=>{
            return this.inputEnglishText();
        })
        .then(()=>{
            return this.getKoreanTarget().then((string)=>{
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