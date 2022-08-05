import { Actions, By, Key, WebDriver, WebElement } from "selenium-webdriver";
import App from './../index';
import * as clipboard from 'copy-paste';

class Util {
    static instance: Util;
    static getInstance(){
        if(!this.instance){
            this.instance = new Util();    
        }
        return this.instance;
    }

    constructor(){
    }

    makeCopy(text : string) : Promise<void> {
        clipboard.copy(text,()=>{});
        return Promise.resolve()
    }

    pasteCurrent(elem : WebElement) : Promise<void> {
        return elem.click()
        .then(()=>{
            elem.sendKeys(Key.CONTROL,'v');
        })
    }

    getNewTab(elem : WebElement, text) : Promise<void> {
        return elem.sendKeys(Key.CONTROL,'t')
        .then(()=>{
            let textbox : WebElement = null!;
            textbox = App.driver.findElement(By.id('input'));

            return textbox.click()
            .then(()=>{
                textbox.sendKeys(text);
            })
            .then(()=>{
                return App.driver.getAllWindowHandles().then((value)=>console.log(value));
            })
        })
    }

    putDelay<T>(ms:number,callback:Function | null,target:any):Promise<T>{
        return new Promise((resolve,reject)=>{
            setTimeout(function(){
                callback && callback.call(target).then((any : T)=>{
                    resolve(any);
                })
            },ms);
        })
        
    }
}

export default Util;