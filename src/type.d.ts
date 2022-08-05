interface SearchProductData {
    productId : number
    productName : string
    productPrice : number
    productImage : string
    productUrl : string
    keyword : string
    rank : number
    isRocket : boolean
    isFreeShipping : boolean
}

interface AxiosSearchResponse {
    rCode : number
    rMessage : string,
    data : {
        landingUrl : string
        productData : SearchProductData[]
    }
}