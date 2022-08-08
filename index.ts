import {Builder, ChromiumWebDriver, Options, Session, WebDriver} from "selenium-webdriver";
import * as Chrome from "selenium-webdriver/chrome";

import Login from "./src/pages/Login";
import Blog from "./src/pages/blog";
import Util from "./src/util"
import { Command } from "selenium-webdriver/lib/command";
import ContentMaker from "./src/contentMaker/contentMaker";

class App {

  public static ContentMaker : ContentMaker;
  public static driver : WebDriver & ChromiumWebDriver;
  
  private options : Chrome.Options;

  private login : Login;
  private blog : Blog;
  private util : Util;

  private static tabs : string[] = [];

  constructor(){
    // Init WebDriver
    App.driver = new Builder()
    .setChromeOptions(this.options)
    .forBrowser('chrome')
    .build();

    // Login
    this.login = new Login();

    // Blog
    this.blog = new Blog();

    // Util
    this.util = new Util();
  }

  run() : void{
    App.driver.sendAndGetDevToolsCommand("Page.addScriptToEvaluateOnNewDocument",{"source":`
      console.log('hello');
      Object.defineProperty(navigator,'webdriver',{get:()=>undefined})
    `})
    .then((val)=>{
      console.log(val);
      return Promise.resolve();
    })
    .then(()=>{
      try{
        App.driver.get('https://naver.com')
        .then(()=>{
          App.ContentMaker = new ContentMaker();
          return App.ContentMaker.run();
        })
        .then(()=>{
          return this.login.run();
        })
        .then(()=>{
          return Util.getInstance().putDelay(5000,function(){
            return this.blog.run();
          },this);
        })
        .then(()=>{
          console.log("FINISH!");
        })
      } catch (err){
        console.error(err);
      }
    })
  }

  quit():void{
    App.driver.quit();
  }

  setOptions(opts : string[] | string) : void{
    let options : string[] = [];
    if(typeof opts === 'string'){
      options.push(opts)
    } else {
      options = opts;
    }
    options.forEach((arg)=>{
      this.options.addArguments(arg);
    })
  }

  public static addCurrentTab() : Promise<void>{
    return App.driver.getWindowHandle().then((tabName)=>{
      this.tabs.push(tabName);
      return Promise.resolve();
    })
    .then(()=>{
      return App.driver.getAllWindowHandles().then((tabs)=>{
        if(tabs.length !== this.tabs.length)
          throw new Error("tab length is not same");
  
        console.log("\n Add Current Tab Succeed! ");
      })
    })
    .catch(console.error);
  }

  public static getTabName(index : number) : string{
    return this.tabs[index];
  }

}

export default App;

var app = new App();
app.run();