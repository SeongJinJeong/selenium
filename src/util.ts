import { Actions, By, Key, WebDriver, WebElement } from "selenium-webdriver";
import App from '../index';
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

<<<<<<< HEAD:src/util.ts
    putDelay(ms:number,callback:Function | null,target:any):Promise<void>{
=======
    putDelay(ms:number,callback:()=>Promise<void>,target:any):Promise<void>{
>>>>>>> 0a02710242af251acdc9d7a1772a01ab4d2f94c9:util.ts
        return new Promise((resolve,reject)=>{
            setTimeout(function(){
                callback && callback.call(target).then(()=>{
                    resolve();
                })
            },ms);
        })
        
    }
}

export default Util;