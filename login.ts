import { By, Key, WebDriver, WebElement } from "selenium-webdriver";
import Util from './util'
import DEFINES from './defines/defines';
import App from ".";

class Login {
    public driver : WebDriver;
    
    constructor(){}

    run():Promise<void>{
        console.log("Login Start!");
        return this.doLoginProcess();
    }

    doLoginProcess() : Promise<void> | undefined {
        try {
            return this.getLoginPage()
                .then(()=>{
                    return this.selectLoginBox();
                })
                .then(()=>{
                    return this.enterID();
                })
                .then(()=>{
                    return this.enterPW();
                })
                .then(()=>{
                    return this.clickLogin();
                })
        }
        catch(err){
            console.log(err);
        }
    }

    getLoginPage() : Promise<void> {
        return App.driver.findElement(By.className('link_login'))
        .then((webElement)=>{
            return webElement.click();
        })
    }

    selectLoginBox() : Promise<void> {
        return App.driver.findElement(By.className('menu_id'))
        .then((elem)=>{
            return elem.click();
        })
    }

    enterID() : Promise<void> {
        let idTextField : WebElement = null;

        idTextField = App.driver.findElement(By.id('id'));
        idTextField.sendKeys(Key.F12);
        return idTextField.click()
        .then(()=>{
            return Util.getInstance().makeCopy(DEFINES.LOGIN.LOGIN_ID)
            .then(()=>{
                idTextField.sendKeys(Key.CONTROL,'v');
            })
        })
    }

    enterPW() : Promise<void> {
        let pwTextField : WebElement = null;
        
        pwTextField = App.driver.findElement(By.id('pw'));
        return pwTextField.click()
        .then(()=>{
            Util.getInstance().makeCopy(DEFINES.LOGIN.LOGIN_PW);
            return pwTextField.sendKeys(Key.CONTROL,'v');
        })
    }

    clickLogin() : Promise<void> {
        let loginBtn : WebElement = null;

        loginBtn = App.driver.findElement(By.id('log.login'));
        return loginBtn.click();
    }
}

export default Login;