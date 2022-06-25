import App from './index';
import DEFINES from './defines/defines';

class Blog {
    constructor(){}

    run() : Promise<void>{
        console.log("Blog Started!");
        return this.getWritePage();
    }

    getWritePage() : Promise<void>{
        return App.driver.get(DEFINES.PAGE_URL.BLOG_WRITE);
    }
}

export default Blog;