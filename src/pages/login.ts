import { By, Key, WebDriver, WebElement } from "selenium-webdriver";
import Util from '../util'
import DEFINES from '../../defines/defines';
import App from "../../index";

class Login {
    public driver : WebDriver;
    
    constructor(){}

    async run():Promise<void>{
        console.log("Login Start!");
        await this.doLoginProcess();
    }

    async doLoginProcess() : Promise<void>{
        try {
            await this.gotoNaver()
            await Util.getInstance().putDelay(3000,this.getLoginPage,this);    
            await Util.getInstance().putDelay(3000,this.selectLoginBox,this);  
            await this.enterID();  
            await Util.getInstance().putDelay(1000,this.enterPW,this); 
            await this.clickLogin();   
        }
        catch(err){
            console.log(err);
        }
    }

    async doPageLoginProcess() : Promise<void> {
        try {
            await this.selectLoginBox() 
            await this.enterID();  
            await Util.getInstance().putDelay(1000,this.enterPW,this);  
            await this.clickLogin();
        }
        catch(err){
            console.log(err);
        }
    }

    async gotoNaver() : Promise<void> {
        await App.driver.get('https://www.naver.com');
    }

    async getLoginPage() : Promise<void> {
        const webElement = await App.driver.findElement(By.className('link_login'))
        await webElement.click();
    }

    async selectLoginBox() : Promise<void> {
        const elem = await App.driver.findElement(By.className('menu_id'))
        await elem.click();
    }

    async enterID() : Promise<void> {
        let idTextField : WebElement = null!;

        idTextField = await App.driver.findElement(By.id('id'));
        await idTextField.click();
        await Util.getInstance().makeCopy(DEFINES.LOGIN.LOGIN_ID)
        idTextField.sendKeys(Key.CONTROL,'v');
    }

    async enterPW() : Promise<void> {
        let pwTextField : WebElement = null!;
        
        pwTextField = await App.driver.findElement(By.id('pw'));
        await pwTextField.click();
        await Util.getInstance().makeCopy(DEFINES.LOGIN.LOGIN_PW);
        await pwTextField.sendKeys(Key.CONTROL,'v');
    }

    async clickLogin() : Promise<void> {
        let loginBtn : WebElement = null!;

        loginBtn = await App.driver.findElement(By.id('log.login'));
        await loginBtn.click();
    }
}

export default Login;