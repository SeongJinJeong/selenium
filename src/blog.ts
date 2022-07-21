import App from './index';
import DEFINES from '../defines/defines';
import { By, WebElement } from 'selenium-webdriver';
import Util from './util';

class Blog {
    constructor(){}

    run() : Promise<void>{
        console.log("Blog Started!");
        return this.getWritePage()
        .then(()=>{
            return Util.getInstance().putDelay(5000,this.selectTitle,this);
        })
    }

    getWritePage() : Promise<void>{
        return App.driver.get(DEFINES.PAGE_URL.BLOG_WRITE);
    }

    selectTitle() : Promise<void>{
        let elem : WebElement= null;
        var xpath : string =  "//p[contains(.,\'제목\')]";
        return new Promise((resolve,reject)=>{
            setTimeout(()=>{
                App.driver.findElement(By.id("SE-d79a927a-f704-47f1-8d19-52536082c701"))
                .then((e)=>{
                    console.log(e);
                    elem = e;
                    elem.click()
                    .then(()=>{
                        resolve();
                    })
                });
            },3000)  
        })
    }
}

export default Blog;