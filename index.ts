import {Builder, ChromiumWebDriver, Session, WebDriver} from "selenium-webdriver";
import {Options} from "selenium-webdriver/chrome";

import Login from "./src/pages/Login";
import Blog from "./src/pages/blog";
import Util from "./src/util"
import { Command } from "selenium-webdriver/lib/command";
import ContentMaker from "./src/contentMaker/contentMaker";
import DEFINES from "./defines/defines";

class App {

  public static isRunning : boolean = false;

  public static ContentMaker : ContentMaker;
  public static driver : WebDriver & ChromiumWebDriver;
  
  private options : Options;

  private login : Login;
  private blog : Blog;
  private util : Util;

  private static tabs : string[] = [];

  constructor(){
    // Init WebDriver
    this.options = new Options();
    this.options.setUserPreferences(
      {
        profile: {
          content_settings: {
              exceptions: {
                  clipboard: {
                      ['https://blog.naver.com,*']:
                          {
                              "expiration": "0",
                              "last_modified": Date.now(),
                              "model": 0,
                              "setting": 1
                          },
                  }
              }
          }
      }
      }
    )
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

  run() : Promise<void>{
    return App.driver.sendAndGetDevToolsCommand("Page.addScriptToEvaluateOnNewDocument",{"source":`
      console.log('hello');
      Object.defineProperty(navigator,'webdriver',{get:()=>undefined})
    `})
    .then((val)=>{
      console.log(val);
      return Promise.resolve();
    })
    .then(()=>{
      try{
        return App.driver.get('https://naver.com')
        .then(()=>{
          
          if(App.isRunning){
            return App.ContentMaker.run();
          } else {
            return App.addCurrentTab().then(()=>{
              App.ContentMaker = new ContentMaker();
              return App.ContentMaker.run();
            })
          }
        })
        .then(()=>{
          if(App.isRunning){
            return Promise.resolve();
          }
          return this.login.run();
        })
        .then(()=>{
          return Util.getInstance().putDelay(5000,function(){
            return this.blog.run();
          },this);
        })
        .then(()=>{
          App.isRunning = true;
          App.ContentMaker.reset();
          console.log("FINISH!");
          return Promise.resolve();
        })
      } catch (err){
        console.error(err);
        return Promise.reject(err);
      }
    })
  }

  quit():Promise<void>{
    return App.driver.quit();
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

  public static removeLastTab() : void {
    this.tabs.pop();
  }

}

export default App;

var app = new App();

function runApp(){
  try {
    setTimeout(function(){
      app.run().then(()=>{
        runApp();
      })
    },App.isRunning ? DEFINES.DELAY_TIME.EXECUTE_TERM : 1000);
  } catch (err){
    console.log("\n\n\n\n\n\n ERROR!!!!!! "+err+"\n\n\n\n\n\n");
    console.log("\n\n\n\n\n\n RESTART APP!!!! \n\n\n\n\n\n");
    App.isRunning = false;
    app.quit().then(()=>{
      runApp();
    })
  }
}

try {
  runApp();
} catch(err){
  console.log(err);
}