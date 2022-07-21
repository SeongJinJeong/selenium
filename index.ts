import {Builder, Options, WebDriver} from "selenium-webdriver";
import * as Chrome from "selenium-webdriver/chrome";

import Login from "./src/pages/Login";
import Blog from "./src/pages/blog";
import Util from "./src/util"

class App {

  public static driver : WebDriver;
  private options : Chrome.Options;

  private login : Login;
  private blog : Blog;
  private util : Util;

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
    try{
      App.driver.get('https://naver.com')
      .then(()=>{
        return this.login.run();
      })
      .then(()=>{
        return Util.getInstance().putDelay(5000,function(){
          this.blog.run();
        },this);
      })
      .then(()=>{
        console.log("FINISH!");
      })
    } catch (err){
      console.error(err);
    }
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

}

export default App;

var app = new App();
app.run();