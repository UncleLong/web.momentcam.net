﻿if (!('MomentCam' in window)) {
    window['MomentCam'] = {}
}
MomentCam.urls = {
    checkUser: "//user.momentcam.net/api/user/GetUserByToken",
    loginUrl: "//user.momentcam.net/api/user/login",
    regUrl: "//user.momentcam.net/api/user/Register",
    RegAndLogin: "//user.momentcam.net/api/user/RegisterAndLogin",
    checkUserUrl: "//user.momentcam.net/api/user/CheckUserName",
    getProductUrl: "//product.momentcam.net/api/product/GetProduct",
    carouseFigureMaskUrl: "//renderapi-i.momentcam.net/API/CarouseFigureMask.ashx",
    authUrl: "//or.momentcam.net/resource/getresoucebyname.ashx",
    syncOrderDataUrl: "//renderapi-i.momentcam.net/API/SyncOrderData.ashx",
    getFacesUrl: "//renderapi-i.momentcam.net/API/GetFaces.ashx",
    serverRender: "//renderapi-i.momentcam.net/API/ServerRender.ashx",
    regionsURL: "//user.momentcam.net/api/Region/GetRegionsByPId",
    getAllAdressUrl: "//user.momentcam.net/api/Addr/GetAddrs",
    insertAddressUrl: "//user.momentcam.net/api/Addr/InsertAddress",
    updateAddressUrl: "//user.momentcam.net/api/Addr/UpdateAddress",
    deleteAddressUrl: "//user.momentcam.net/api/Addr/DeleteAddress",
    setDefaultUrl: "//user.momentcam.net/api/Addr/SetDefaultAddress",
    SyncOrderItemsDataUrl: "//renderapi-i.momentcam.net/API/SyncOrderItemsData.ashx",
    getAddrUrl: "//user.momentcam.net/api/Addr/GetAddr",
    submitVirtualOrderUrl: "//trade.momentcam.net/api/Mobile/SubmitVirtualOrder",
    submitOrderUrl: "//trade.momentcam.net/api/Mobile/SubmitOrder",
    getTradeFlow: "//trade.momentcam.net/api/Mobile/GetTradeFlow",
    getInvoiceContent: "//trade.momentcam.net/api/Mobile/GetInvoiceContent", //发票内容
    saveInvoice: "//trade.momentcam.net/api/Mobile/SaveInvoice", //保存发票
    getSendDataTypes: "//trade.momentcam.net/api/Mobile/GetSendDataTypes", //获取送货时间
    saveCoupon: "//trade.momentcam.net/api/Mobile/SaveCoupon", //优惠码
    saveShipment: "//trade.momentcam.net/api/Mobile/SaveShipment", //保存送货方式
    saveConsignee: "//trade.momentcam.net/api/Mobile/SaveConsignee", //保存收货地址//trade.momentcam.net/api/Mobile/SaveConsignee
    submitVirtualOrder: "//trade.momentcam.net/api/Mobile/SubmitVirtualOrder", //提交虚拟品订单
    pay: "//pay.momentcam.net/content/braintreePayOrder.html", // H5手机网页支付跳转链接
    getallthemeUrl: "//or.momentcam.net/theme/getalltheme.ashx", //获取分类列表
    getresourceUrl: "//or.momentcam.net/resource/getresource.ashx", //获取素材 
    updateSkinColorsURL: "//renderapi-i.momentcam.net/API/AddOrUpdateComicSkinColors.ashx", //设置肤色
    getSettingsUrl: "//config.momentcam.net/Json/GetSettings.ashx", //获取肤色色值
    updataMakeUpUrl: "//renderapi-i.momentcam.net/API/AddOrUpdateAttachments.ashx", //修改美妆
    getFaceUidUrl: "//renderapi-i.momentcam.net/API/FaceDetection.ashx", //获取faceUID
    fileUploadUrl: "//imgupload.momentcam.net/api/Image/Upload",
    searchThemeUrl: "//search.momentcam.net/searchServer/search/relevance.do", //联想词url
    hotSearchUrl: "//search.momentcam.net/searchServer/search/getHotSearch.do", //热搜词url
    HairStyleMatchUrl: "//renderapi-i.momentcam.net/API/HairStyleMatch.ashx",
    FaceShapeMatchUrl: "//renderapi-i.momentcam.net/API/FaceShapeMatch.ashx",
    GetAllRegionCode: "//user.momentcam.net/api/Region/GetAllRegionCode",//获取国家列表
    CartoonUrl: '//mall-res.momentcam.net/Images/MagicShop/',//漫画大图地址
    CartoonIconUrl: "//mall-res.momentcam.net/Images/GiftAD/",//漫画图标地址
    searchResourceUrl: "//search.momentcam.net/searchServer/search/search.do", //搜索url
    searchThemeUrl: "//search.momentcam.net/searchServer/search/relevance.do", //联想词url
    submitVirtualProduct: "//trade.momentcam.net/api/Mobile/SubmitVirtualOrder",
    getProductInfo: "//or.momentcam.net/product/getproductinfo.ashx",
    OrderReturnUrl: "//web.momentcam.net/Pages/Success.html",
    GetUserAddressList: "//user.momentcam.net/api/Addr/GetAddrs",
    digitalCoupon: "//or.momentcam.net/couponcode/usecouponcode.ashx",
    checkCoupon: "//or.momentcam.net/couponcode/checkcode.ashx",
    GetFavoriteUrl: "//asset.momentcam.net/Favorite/GetAllFavorites.ashx",
    addusercartoonsorder: "//or.manboker.com/h5/addusercartoonsorder.ashx",//提交用户购买高清图接口
    getusercartoonsorder: "//or.manboker.com/h5/getusercartoonsorder.ashx",//获取用户购买的高清图
    VirtualID: 424,
    VirtualIDWithC: 444,
}
storage = {
    get: function (key) {
        return window['sessionStorage'].getItem(key);
    },
    set: function (key, value) {
        window['sessionStorage'].setItem(key, value);
    },
    remove: function (key) {
        window['sessionStorage'].removeItem(key);
    }
};
MomentCam.config = {
    platform: 'pc:1.0:fb',
    countryCode: 'CN',
    lang: 'zh-cn',
    isSupportWebp: false,
    imageSuffix: "x-oss-process=image/resize,m_lfit,h_100,w_100/format,jpg",
}
try {
    var canvas = document.createElement('canvas');
    MomentCam.config.isSupportWebp = canvas.getContext && canvas.getContext('2d') && canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
} catch (err) {
}

//如果浏览器支持webp图像格式,为图像增加webp
MomentCam.appendWebpForImgUrl = function (imgUrl) {
    if (!imgUrl || !MomentCam.config.isSupportWebp) {
        return imgUrl;
    }
    return imgUrl + '?x-oss-process=image/format,' + (MomentCam.config.isSupportWebp ? 'webp' : 'jpg') + '/resize,w_200';
}

//根据浏览器获取最优的图片地址
MomentCam.getOptimizedImgUrl = function (imgUrl, maxWidth) {
    if (!imgUrl) {
        return imgUrl;
    }
    var param = '?x-oss-process=image/format,' + (MomentCam.config.isSupportWebp ? 'webp' : 'jpg');

    if (maxWidth && maxWidth > 0) {
        param += '/resize,w_' + maxWidth;
    }
    return imgUrl + param;
}
MomentCam.skinSetting = { "defaultColorID": 1, "comicSkinColors": [{ "genderColors": { "femaleColor": { "iconRGBColor": "252,211,187", "skinMap": { "face_shade": "178,111,95,98,56,42", "etou": "248,195,167,248,195,167", "pifu": "255,241,232,191,71,0", "face_skin": "255,231,217,252,211,187", "saihong": "245,194,174,245,194,174", "face_sucai": "252,211,187,252,211,187", "face_brow": "0,0,0,182,126,113", "face_eye": "0,0,0,99,62,48", "lip_color": "239,159,144,170,88,83", "lip_shade": "244,181,164,244,181,162", "lip_highlight": "236,141,141,160,60,80" }, "bodyMap": { "pifu": "255,239,229,191,71,0" } }, "maleColor": { "iconRGBColor": "247,203,177", "skinMap": { "face_shade": "178,111,95,98,56,42", "etou": "240,185,158,240,185,158", "pifu": "255,241,232,191,71,0", "face_skin": "255,231,217,247,203,177", "saihong": "243,186,162,243,186,162", "face_sucai": "247,203,177,247,203,177", "face_brow": "0,0,0,182,126,113", "face_eye": "0,0,0,86,53,41", "lip_color": "230,158,146,109,50,42", "lip_shade": "230,158,146,109,50,42", "lip_highlight": "230,158,146,109,50,42" }, "bodyMap": { "pifu": "255,239,229,191,71,0" } } }, "colorID": 1 }, { "genderColors": { "femaleColor": { "iconRGBColor": "244,192,161", "skinMap": { "face_eye": "67,37,24,67,37,24", "face_brow": "120,66,45,120,66,45", "face_sucai": "244,197,169,244,197,169", "saihong": "242,186,164,242,186,164", "etou": "245,188,158,178,111,75", "lip_color": "223,134,116,205,87,75", "face_skin": "255,231,217,244,197,169", "face_shade": "140,67,55,75,33,20" }, "bodyMap": { "pifu": "252,211,187,197,126,82" } }, "maleColor": { "iconRGBColor": "244,192,161", "skinMap": { "face_eye": "0,0,0,86,53,41", "face_brow": "0,0,0,182,126,113", "face_sucai": "244,197,169,244,197,169", "saihong": "242,186,164,242,186,164", "etou": "245,188,158,178,111,75", "lip_color": "230,158,146,109,50,42", "face_skin": "255,231,217,239,191,162", "face_shade": "140,67,55,75,33,20" }, "bodyMap": { "pifu": "252,211,187,192,121,77" } } }, "colorID": 4 }, { "genderColors": { "femaleColor": { "iconRGBColor": "219,163,124", "skinMap": { "face_shade": "140,67,55,75,33,20", "etou": "226,170,136,226,170,136", "pifu": "212,138,88,70,25,0", "face_skin": "255,231,217,235,187,156", "saihong": "229,171,145,229,171,145", "face_sucai": "230,181,150,235,187,156", "face_brow": "0,0,0,120,66,45", "face_eye": "0,0,0,67,37,24", "lip_color": "212,127,111,127,64,61", "lip_shade": "212,127,111,127,64,61", "lip_highlight": "212,127,111,127,64,61" }, "bodyMap": { "pifu": "237,191,161,187,117,72" } }, "maleColor": { "iconRGBColor": "219,163,124", "skinMap": { "face_shade": "140,67,55,75,33,20", "etou": "212,154,119,212,154,119", "pifu": "212,138,88,70,25,0", "face_skin": "255,231,217,227,174,140", "saihong": "212,144,119,212,144,119", "face_sucai": "227,177,145,227,174,140", "face_brow": "0,0,0,120,66,45", "face_eye": "0,0,0,67,37,24", "lip_color": "204,130,100,123,59,36", "lip_shade": "217,138,120,130,55,53", "lip_highlight": "217,138,120,130,55,53" }, "bodyMap": { "pifu": "235,187,156,187,110,72" } } }, "colorID": 2 }, { "genderColors": { "femaleColor": { "iconRGBColor": "184,116,71", "skinMap": { "face_shade": "100,49,29,69,38,29", "etou": "178,111,75,178,111,75", "pifu": "212,138,88,70,25,0", "face_skin": "255,231,217,191,133,93", "saihong": "183,115,73,183,115,73", "face_sucai": "187,128,88,187,128,88", "face_brow": "0,0,0,120,66,45", "face_eye": "0,0,0,67,37,24", "lip_color": "169,100,63,124,40,26", "lip_shade": "173,94,87,99,39,31", "lip_highlight": "86,7,0,86,7,0" }, "bodyMap": { "pifu": "198,139,98,124,67,49" } }, "maleColor": { "iconRGBColor": "184,116,71", "skinMap": { "face_shade": "100,49,29,76,42,32", "etou": "169,110,78,169,110,78", "pifu": "212,138,88,70,25,0", "face_skin": "255,231,217,186,126,89", "saihong": "183,120,73,183,120,73", "face_sucai": "187,128,88,187,128,88", "face_brow": "0,0,0,120,66,45", "face_eye": "0,0,0,67,37,24", "lip_color": "170,97,91,112,60,47", "lip_shade": "170,97,91,112,60,47", "lip_highlight": "170,97,91,112,60,47" }, "bodyMap": { "pifu": "199,136,93,118,61,44" } } }, "colorID": 3 }, { "genderColors": { "femaleColor": { "iconRGBColor": "152,90,47", "skinMap": { "face_eye": "67,37,24,42,21,12", "face_brow": "120,66,45,100,48,28", "face_sucai": "152,90,47,152,90,47", "saihong": "152,82,47,152,82,47", "etou": "136,76,44,136,76,44", "lip_color": "169,85,78,96,34,25", "face_skin": "255,231,217,152,90,47", "face_shade": "89,39,20,75,33,20" }, "bodyMap": { "pifu": "153,91,47,123,65,25" } }, "maleColor": { "iconRGBColor": "152,90,47", "skinMap": { "face_eye": "67,37,24,42,21,12", "face_brow": "120,66,45,100,48,28", "face_sucai": "152,90,47,152,90,47", "saihong": "152,82,47,152,82,47", "etou": "136,76,44,136,76,44", "lip_color": "169,85,78,96,34,25", "face_skin": "255,231,217,152,90,47", "face_shade": "89,39,20,75,33,20" }, "bodyMap": { "pifu": "153,91,47,123,65,25" } } }, "colorID": 5 }], "skinValueThreePoints": [255, 255, 255, 0, 0, 0, 156, 110, 85], "skinValueDetected": [212, 177, 155, 33, 20, 15, 75, 37, 15], "nameToID": { "white": 1, "wheat": 2, "dark": 3 }, "StatusCode": 0, "Description": "" };
$.ajaxSetup({
    headers: {
        // 默认添加请求头
        'Lang': MomentCam.config.lang,
        'Platform': MomentCam.config.platform,
        'EncryptType': 'NONE'
    }
});
String.prototype.startWith = function (s) {
    if (s == null || s == "" || this.length == 0 || s.length > this.length)
        return false;
    if (this.substr(0, s.length) == s)
        return true;
    else
        return false;
    return true;
}

String.prototype.endWith = function (s) {
    if (s == null || s == "" || this.length == 0 || s.length > this.length)
        return false;
    if (this.substring(this.length - s.length) == s)
        return true;
    else
        return false;
    return true;
}

function CallAjax(url, data, callBack) {//请求数据
	var _url = url;
    jQuery.ajax({
        type: "post",
        async: true,
        url: url,
        data: data,
        cache: false,
        success: function (result) {
            try {
            	if(typeof result == "object"){
            		callBack(result);
            	}else{
                	return callBack(JSON.parse(result));
               }
            } catch (e) {
            	//return callBack()
            	console.log(_url);
                throw e.message;
            }
        },
        error: function (e) {
            throw e.message;
        }
    });
}
function stop() {
    return false;
}
document.oncontextmenu = stop;