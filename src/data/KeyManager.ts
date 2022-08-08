import DEFINES from "../../defines/defines";
import KeyGenterator from "./hmacGenerator"

class KeyManager {
    private keyGenerator : KeyGenterator = null;
    constructor(){
        this.keyGenerator = new KeyGenterator(DEFINES.KEYS.SECRET_KEY,DEFINES.KEYS.ACCESS_KEY);
    }

    private hmacKey : string = null!;
    private static instance : KeyManager = null!;

    public static getInstance(){
        if(this.instance === null)
            this.instance = new KeyManager();
            
        return this.instance;
    }

    async getKey(method : string, url : string) {
        let key = await this.keyGenerator._generateKey(method,url);
        return key;
    }
}

export default KeyManager;