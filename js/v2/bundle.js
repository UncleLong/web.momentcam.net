(function (w) {
    var isFromNext = false;
    var B = {
        config: {
            ImagePrefix: "https://mall-res.momentcam.net/",
            needRemoveItems: ['205', '206', '207', '186', '187'],
        },
        init: function () {
            if (Parameters.Gender == 2) {
                $(".tab .beard").remove();
            } else {
                $(".tab .eyes").remove();
            }
            clickBind();
            this.InitHead();
        },
        InitHead: function () {
            var matchIndex = 0;
            var offset = Parameters.offset -0;
            if (offset > 30)
                offset = 30;
            Parameters.dy = -220 + offset;
            Parameters.AttachData.push({
                "Type": "11",
                "PositionType": "head",
                "ResourceID": "",
                "m11": "1",
                "m21": "0",
                "dx": "0",
                "m12": "0",
                "m22": "1",
                "dy": "-220"
            });
            var postD = "faceuid=" + Parameters.FACEUID + "&isfemale=" + (Parameters.Gender == 1 ? "false" : "true");
            // console.log("开始匹配发型和脸型-------------");

            CallAjax(MomentCam.urls.HairStyleMatchUrl, postD, function (r) {
                //Loading("hide");
                matchIndex++;
                Parameters.AttachData.push({
                    "Type": "10",
                    "PositionType": "hair",
                    "ResourceID": "" + r["Results"][0].replace("055", "057") + "",
                    "m11": "1",
                    "m21": "0",
                    "dx": "0",
                    "m12": "0",
                    "m22": "1",
                    "dy": "" + Parameters.dy + ""
                });
                var object = {};
                object.name = r["Results"][0];
                object.typeID = "10";
                object.typeName = "hair";
                Parameters.assetsSaver["hair"] = object;
                CheckRender(matchIndex, 376);
            });
            CallAjax(MomentCam.urls.FaceShapeMatchUrl, postD, function (r) {
                matchIndex++;
                Parameters.AttachData.push({
                    "Type": "7",
                    "PositionType": "face",
                    "ResourceID": "" + r["Results"][0].replace("016", "041") + "",
                    "m11": "1",
                    "m21": "0",
                    "dx": "0",
                    "m12": "0",
                    "m22": "1",
                    "dy": "" + Parameters.dy + ""
                })
                var object = {};
                object.name = r["Results"][0];
                object.typeID = "7";
                object.typeName = "face";
                Parameters.assetsSaver["face"] = object;
                CheckRender(matchIndex, 375);
            });
        },

        GoRender: function (bg, callback) {
            var _ = this;
            $(".specList").html('').hide();
            $(".Btns").find(".Buy").hide().end().find(".Share").css("float", "none").css("background-repeat", "no-repeat").css("margin", "0 auto");
            if (bg && Parameters.RenderSaver[bg]) {
                Parameters.clickCheck = true;
                //console.log(Parameters.RenderSaver[bg].Path);
                Parameters.link = Parameters.RenderSaver[bg].Path;
                $("[name='renderResult']").attr("src", (Parameters.RenderSaver[bg].Path + Parameters.RenderPrefix).replace("http:", "https:"));
                $(".CoverMask").hide();
                POP.CloseLoading();
                if (callback)
                    return callback("");
                return;
            } else {
                Parameters.RenderSaver[bg] = {};
            }
            POP.StartLoading();
            var json = {};
            if (!bg) {
                json.BackgroundName = Parameters.Gender == 1 ? Parameters.maleBG : Parameters.femaleBG;
            } else {
                Parameters.BGID = bg;
                json.BackgroundName = bg + "02";
            }
            json.Heads = [];
            json.Heads.push({
                "Key": Parameters.FACEUID,
                "Value": 0
            });
            Parameters.Heads = json.Heads;
            json.GrayStyle = 1;
            json.AddWaterMark = "1";
            json.ImageFormatType = MomentCam.config.isSupportWebp ? 2 : 2;
            CallAjax(MomentCam.urls.serverRender, "json=" + JSON.stringify(json), function (result) {
                result.Path = result.Path.replace("square-ali.manboker.com", "square.oss-cn-hangzhou.aliyuncs.com").replace("production-us.manboker.com", "moman-production-us.oss-us-west-1.aliyuncs.com");
                loadImage(result.Path + Parameters.RenderPrefix, function () {
                    Parameters.clickCheck = true;
                    Parameters.RenderSaver[bg].Path = result.Path;
                    // console.log("Final Path: " + result.Path);
                    Parameters.link = result.Path;
                    $(".ComicShow").removeClass("NoBorder");
                    $("[name='renderResult']").attr("src", (result.Path + Parameters.RenderPrefix).replace("http:", "https:")).hide().fadeIn(300);
                    $(".CoverMask").hide();
                    POP.CloseLoading();
                    if (callback)
                        return callback("");
                });
            });
        }
    }
    function ChangeResource(name, typeID, typeName) {
        var _this = this;
        Delete_Data(typeName);
        insert_Data(typeID, typeName, name);

        function insert_Data(type, positionType, resourceID) {
            if (positionType == "hair") {
                resourceID = Parameters.hairColor + resourceID.substr(3, resourceID.length);
            }
            Parameters.AttachData.push({
                "Type": "" + type + "",
                "PositionType": "" + positionType + "",
                "ResourceID": "" + resourceID + "",
                "m11": "1",
                "m21": "0",
                "dx": "0",
                "m12": "0",
                "m22": "1",
                "dy": (positionType == "beard" ? "-70" : Parameters.dy)
            });;
        }
        UpdateAssets();
    }
    function Delete_Data(PositionType, isCancel) {
        POP.StartLoading();
        var delKey = PositionType;
        for (var i = 0; i < Parameters.AttachData.length; i++) {
            var keyTemp = Parameters.AttachData[i].PositionType
            if (keyTemp === delKey) {
                Parameters.AttachData.splice(i, 1);
            }
        }
        if (isCancel) {
            UpdateAssets();
        }
    }
    function ResourceCall(id, callback) {
        var data = {};
        data.localtime = "";
        data.test = "";
        data.language = "zh";
        if (B.config.needRemoveItems.indexOf(id) != -1) {
            data.fromtype = "android";
        } else {
            data.fromtype = "h5";
        }
        data.appversion = "1";
        data.dateversion = 0;
        data.themeid = id;
        data.coreid = 5;
        var result;
        jQuery.ajax({
            type: "post",
            async: true,
            url: MomentCam.urls.getresourceUrl,
            timeout: 25000,
            cache: false,
            data: "language=en&fromtype=h5&appversion=76&extend=" + JSON.stringify(data),
            success: function (data) {
                try {
                    return callback(JSON.parse(data));
                } catch (e) {
                    return callback("");
                }
            }
        });
    }

    function CheckRender(index, id) {
        var _this = this;
        if (index == 2) {
            GetSkin();
            //console.log("开始设置FaceUID素材------------");
            UpdateSkin();
            GetAssets("376", "top", { type: "10", id: "376", name: "hair" });
            GetAssets("375", "bottom", { type: "7", id: "375", name: "face" });
        }

    }
    function clear() {
        $(".fairList .fairColor").each(function () {
            $(this).find("img").attr("src", $(this).find("img").attr("src").replace("_click.png", ".png"));
        });
        $("#hairColor .fairColor").eq(0).find("img").attr("src", $("#hairColor .fairColor").eq(0).find("img").attr("src").replace(".png", "_click.png"));
        $("#skinColor .fairColor").eq(0).find("img").attr("src", $("#skinColor .fairColor").eq(0).find("img").attr("src").replace(".png", "_click.png"));
        Parameters.SwiperObjec = {};
        Parameters.RenderSaver = {};
        Parameters.AttachData = [];
        Parameters.iconActiveSaver = {};
        Parameters.BGID = "";
        Parameters.bgSaver = {};
        Parameters.isRenderProduct = false;
        Parameters.MaskResult = null;
        $(".topPart .tab ul li").eq(0).addClass("active").siblings().removeClass("active");
        $(".bottomPart .tab ul li").eq(0).addClass("active").siblings().removeClass("active");
    }
    function GetAssets(id, c, o) {
        if (c == "top")
            $("#topAssetsContainer").empty();
        else
            $("#bottomAssetsContainer").empty();
        Parameters.themeID = id;
        if (Parameters.SwiperObject[id] != null) {
            renderSwiperDom(Parameters.SwiperObject[id], id, c, o);
        } else {
            if (Parameters.SwiperObject[id] == null) {
                ResourceCall(id, function (result) {
                    Parameters.SwiperObject[id] = result;
                    renderSwiperDom(result, id, c, o);
                });
            }
        }
    }
    function renderSwiperDom(result, id, c, o) {
        try {
            if (Parameters.swiperObj[c]) {
                Parameters.swiperObj[c].setWrapperTranslate(0);
                Parameters.swiperObj[c].destroy();
            }
            var _ = this;
            var imgPathr_Arr = [];
            var imgId_Arr = [];
            var html = "";
            var container = c == "top" ? $("#topAssetsContainer") : $("#bottomAssetsContainer");
            for (var i = 0; i < result.ResourceLst.length ; i++) {
                imgPath = result.ResourceLst[i].ICOPath;
                var sexNum = imgPath.substr(imgPath.lastIndexOf("/") + 4, 1);
                if (B.config.needRemoveItems.indexOf(id) == -1) {
                    if (sexNum != Parameters.Gender) continue;
                }
                imgId_Arr.push(result.ResourceLst[i].Name);
                imgPath = B.config.ImagePrefix + result.ResourceLst[i].ICOPath;
                imgPathr_Arr.push(imgPath);
            }
            if (o.name == "hair") {
                var name = Parameters.assetsSaver["hair"].name.replace("055", "054").slice(0, -2);
                if (imgId_Arr.indexOf(name) == -1) {
                    imgId_Arr.unshift(name);
                } else {
                    var index = imgId_Arr.indexOf(name);
                    imgId_Arr.splice(index, 1);
                    imgPathr_Arr.splice(index, 1);
                    imgId_Arr.unshift(name);
                }
                imgPathr_Arr.unshift(B.config.ImagePrefix + "Images/MomentCamColorV3/hair_icon/" + name + "03");
            }
            if (o.name == "face") {
                var name = Parameters.assetsSaver["face"].name.slice(0, -2);
                if (imgId_Arr.indexOf(name) == -1) {
                    imgId_Arr.unshift(name);
                } else {
                    var index = imgId_Arr.indexOf(name);
                    imgId_Arr.splice(index, 1);
                    imgPathr_Arr.splice(index, 1);
                    imgId_Arr.unshift(name);
                }
                imgPathr_Arr.unshift(B.config.ImagePrefix + "Images/MomentCamColorV3/face/" + name + "03");
            }
            imgId_Arr = imgId_Arr.filter(function (item, pos) {
                return imgId_Arr.indexOf(item) == pos;
            })
            imgPathr_Arr = imgPathr_Arr.filter(function (item, pos) {
                return imgPathr_Arr.indexOf(item) == pos;
            })
            for (var i = 0; i < imgPathr_Arr.length; i++) {
                if (i == 0 && B.config.needRemoveItems.indexOf(id) != -1) {
                    html += '<div class="iconWrapper"><img src="https://mall-res.momentcam.net/Images/mo/Beauty/makeup_icon_cancel.png"  class="cancel"/></div>';
                } else {
                    if (i + 1 > imgPathr_Arr.length) break;
                    html += '<div class="iconWrapper"><img src="' + imgPathr_Arr[i] + '" id="' + imgId_Arr[i] + '"/></div>';
                }
            }
            container.append('<div class="swiper-slide">' + html + '</div>');

            var result = "", result2 = "";
            $.each(container.find(".iconWrapper"), function (i, e) {
                result += " " + checkInView($(e), false, container);
                result2 += " " + checkInView($(e), true, container);
            });
            var firstWord = result.substr(0, 4), endWord = result.substr(result.length - 4);
            //console.log(firstWord + endWord);
            changeBtn(firstWord, endWord, container);
            container.scroll(function () {
                var result = "", result2 = "";
                $.each(container.find(".iconWrapper"), function (i, e) {
                    result += " " + checkInView($(e), false, container);
                    result2 += " " + checkInView($(e), true, container);
                });
                var firstWord = result.substr(0, 4), endWord = result.substr(result.length - 4);
                // console.log(firstWord + endWord);
                changeBtn(firstWord, endWord, container);
            });
            container.attr("data-name", o.name);
            container.attr("data-id", o.id);
            container.attr("data-type", o.type);
            if (Parameters.iconActiveSaver[o.name] && Parameters.iconActiveSaver[o.name]["active"]) {
                var activeIcon = Parameters.iconActiveSaver[o.name]["active"];
                container.find(".swiper-slide #" + activeIcon).addClass("active");
            } else {
                container.find(".swiper-slide .iconWrapper").find("img").eq(0).addClass("active");
            }
        } catch (e) { }
        $(".iconContainer img").unbind("click").bind("click", function () {
            if (!Parameters.clickCheck || $(this).hasClass("active")) {
                return;
            }


            $(this).addClass("active").parent().siblings().find("img").removeClass("active");
            Parameters.clickCheck = false;
            if ($(this).hasClass("cancel")) {
                Delete_Data($(this).parent().parent().parent().attr("data-name"), true);
                $(this).addClass("active").siblings().removeClass("active");
                return;
            }
            $(this).addClass("active").siblings().removeClass("active");
            var object = {};
            object.name = $(this).attr("id") + "02";
            object.typeID = $(this).parent().parent().parent().attr("data-type");
            object.typeName = $(this).parent().parent().parent().attr("data-name");
            Parameters.assetsSaver[object.typeName] = object;
            Parameters.selectSaver[id] = object.name;
            if (!Parameters.iconActiveSaver[object.typeName]) {
                Parameters.iconActiveSaver[object.typeName] = {};
            }
            if (!Parameters.iconActiveSaver[object.typeName]["active"]) {
                Parameters.iconActiveSaver[object.typeName]["active"] = {};
            }
            Parameters.iconActiveSaver[object.typeName]["active"] = object.name.substr(0, object.name.length - 2);
            ChangeResource(object.name, object.typeID, object.typeName);
        });
        // console.log(result);
    }
    function GetSkin() {
        var html = '';
        var _ = this;
        for (var i = 0; i < MomentCam.skinSetting.comicSkinColors.length; i++) {
            if (Parameters.Gender == 1) {
                Parameters.skinArr.push(MomentCam.skinSetting.comicSkinColors[i].genderColors.maleColor);
            } else {
                Parameters.skinArr.push(MomentCam.skinSetting.comicSkinColors[i].genderColors.femaleColor);
            }
        }
    }
    function changeBtn(firstWord, endWord, container) {
        if (firstWord == " tru" && endWord == "true") {
            container.parent().siblings(".swiper-button-prev").css({ "background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_disabled.png?v=233)", "background-size": "cover" });
            container.parent().siblings(".swiper-button-next").css({ "background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_disabled.png?v=233)", "background-size": "cover" });
        } else if (firstWord == " tru" && endWord != "true") {
            container.parent().siblings(".swiper-button-prev").css({ "background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_disabled.png?v=233)", "background-size": "cover" });
            container.parent().siblings(".swiper-button-next").css({ "background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_normal.png?v=233)", "background-size": "cover" });
        } else if (firstWord != " tru" && endWord == "true") {
            container.parent().siblings(".swiper-button-prev").css({ "background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_normal.png?v=233)", "background-size": "cover" });
            container.parent().siblings(".swiper-button-next").css({ "background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_disabled.png?v=233)", "background-size": "cover" });
        } else if (firstWord != " tru" && endWord != "true") {
            container.parent().siblings(".swiper-button-prev").css({ "background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_normal.png?v=233)", "background-size": "cover" });
            container.parent().siblings(".swiper-button-next").css({ "background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_normal.png?v=233)", "background-size": "cover" });
        }
    }
    function UpdateSkin(index) {
        POP.StartLoading();
        if (!index)
            index = 0;
        var _ = this;
        CallAjax(MomentCam.urls.updateSkinColorsURL, 'faceuid=' + Parameters.FACEUID + "&json=" + JSON.stringify(Parameters.skinArr[index]), function (result) {
            //console.log("设置肤色成功");
            UpdateAssets();
        });
    }
    function UpdateAssets() {
        Parameters.RenderSaver = {};
        var data = {};
        data.Attachments = Parameters.AttachData;
        CallAjax(MomentCam.urls.updataMakeUpUrl, 'faceuid=' + Parameters.FACEUID + '&json="' + JSON.stringify(data), function (result) {
            if (Parameters.isRenderProduct) {
                CarouseFigureMask(Parameters.MaskResult, true);
            } else {
                B.GoRender(Parameters.BGID, null);
            }
        });
    }

    function checkInView(elem, partial, container) {
        //var container = $("#topAssetsContainer");
        var contHeight = container.width();
        var contTop = container.scrollLeft();
        var contBottom = contTop + contHeight;

        var elemTop = $(elem).offset().left - container.offset().left;
        var elemBottom = elemTop + $(elem).width();

        var isTotal = (elemTop >= 0 && elemBottom <= contHeight);
        var isPart = ((elemTop < 0 && elemBottom > 0) || (elemTop > 0 && elemTop <= container.width())) && partial;

        return isTotal || isPart;
    }

    function clickBind() {
        var _ = this;
        $(".tab ul li").on("click", function () {
            if ($(this).hasClass("active"))
                return;
            var tabContainer = $(this).hasClass("top") ? $(".topPart ") : $(".bottomPart");
            tabContainer.find("li").each(function () {
                $(this).removeClass("active");
            });
            $(this).addClass("active");
            var id = $(this).attr("data-id");
            Parameters.currentDataName = $(this).attr("data-name");
            Parameters.currentDataType = $(this).attr("data-type");
            if ($(this).hasClass("top"))
                GetAssets(id, "top", { type: $(this).attr("data-type"), id: $(this).attr("data-id"), name: $(this).attr("data-name") });
            else
                GetAssets(id, "bottom", { type: $(this).attr("data-type"), id: $(this).attr("data-id"), name: $(this).attr("data-name") });
        });
        $(".buttonGroup .a").on("click", function (e) {
            e.preventDefault();
            //POP.displayControl(2, isFromNext);
            window.location.href = "selectItem.html?v="+Math.random();
        });
        $(".swiper-button-next").on("click", function () {
            $($(this).parent().find(".swiper-wrapper")).animate({
                scrollLeft: "+=650",
            }, 500, function () {

            });
        });
        $(".swiper-button-prev").on("click", function () {
            $($(this).parent().find(".swiper-wrapper")).animate({
                scrollLeft: "-=650",
            }, 500, function () { });
        });
        $(".resetGroup .b").on("click", function () {
            window.location.href = "upload.html?v="+Math.random();
        });
        $(".fairColor").on("click", function () {
            var imgsrc = $(this).find("img").attr("src");
            if (imgsrc.indexOf("click") > 0 || !Parameters.clickCheck)
                return;
            $(this).parent().find(".fairColor").each(function () {
                $(this).find("img").attr("src", $(this).find("img").attr("src").replace("_click.png", ".png"));
            });
            Parameters.clickCheck = false;
            $(this).find("img").attr("src", imgsrc.replace(".png", "_click.png"));
            if ($(this).parent().attr("id") == "hairColor") {
                Parameters.hairColor = $(this).attr("data-id");
                ChangeResource(Parameters.assetsSaver["hair"].name, Parameters.assetsSaver["hair"].typeID, Parameters.assetsSaver["hair"].typeName);
            } else if ($("#skinColor").css("display") == "inline-block") {
                var index = $(this).index();
                UpdateSkin(index);
            }
        });
    }
    window.B = B;
})(window);

var Coupon = {
    init: function () {
        this.Coupon();
    },
    Coupon: function () {
        if (!$(".Code input").val()) {
            Alert("Coupon code is empty");
            return;
        }
        var _ = this;
        var pid = Cookies.get("FinalProductId")
        var data = {
            Token: Cookies.get("TOKEN"),
            ProductId: pid,
            ProductCount: parseInt($(".CountNum").html()),
            DeviceId: generateUUID(),
            CouponCode: $(".Code input").val()
        };
        if (pid == MomentCam.urls.VirtualID) {
            Parameters.digitalCoupon = $(".Code input").val();
            CallAjax(MomentCam.urls.checkCoupon, "code=" + Parameters.digitalCoupon, function (result) {
                if (result.StatusCode == 80008) {
                    Parameters.virtualObj = null;
                    ProductHandler.GetVirtualProduct(MomentCam.urls.VirtualIDWithC, true);
                } else {
                    Alert("Coupon number not avaliable");
                }
            })
        } else {
            CallAjax(MomentCam.urls.saveCoupon, data, function (result) {
               // console.log(result);
                if (result.StatusCode == 0) {
                    Parameters.ProductName = result.Orders[0].Products[0].ProductName;
                    Parameters.ProductPrice = result.Orders[0].Products[0].SalePrice;
                    $(".productName span").eq(0).html(Parameters.ProductName);
                    $(".productName span").eq(1).html(result.Orders[0].Products[0].SellPropName);
                    var SaleInfo = result.Orders[0].Products[0];
                    $(".rightPart span").eq(0).html("$" + SaleInfo.SalePrice);
                    $(".rightPart span").eq(1).html("x" + SaleInfo.ProductCount);
                    $(".rightPart span").eq(2).html("$" + SaleInfo.SalePrice * SaleInfo.ProductCount);
                    $(".totalPrice .price").html("$" + (result.Orders[0].SalePriceTotal - 0 + result.Orders[0].ShippingFee).toFixed(2));
                    $(".orderPrice .price").html("$" + result.Orders[0].SalePriceTotal);
                    $(".shippingFee .price").html("$" + result.Orders[0].ShippingFee);
                } else {
                    Alert("There is a issue with coupon, please try again");
                }

            });
            //console.log();
        }
    }
};
(function(){
    var CookieData={};
    var ProductObj;
    var isSelectAll = false,
        ConfirmFlag = false;
    var goOrder = {
        Common: function () {
            CookieData = {
                FinalProductId: Cookies.get("FinalProductId"),
                isRenderProduct: Cookies.get("isRenderProduct"),
                userInfo: JSON.parse(Cookies.get("user")),
                ProductImg: Cookies.get("ProductImg"),
            };
            $(".FromWho span").html(CookieData.userInfo.NickName);
            $(".leftPart img#showGoodPic").attr("src", CookieData.ProductImg).show();
            if (CookieData.FinalProductId != 424 && CookieData.FinalProductId != 444) {
                clickCheck = true;
                Parameters.isRenderProduct = true;
                Product.GetProduct(CookieData.FinalProductId);
            }
            else {
                Parameters.FinalProductId = 424;
                Parameters.isRenderProduct = false;
                $(".add,.reduce").css({ "cursor": "not-allowed" });
                $(".UnitPrices span").eq(1).html("$9.99");
                $(".TotlePrices span").eq(1).html("$9.99");
                $(".CountNums").attr("readonly", "readonly");
                $(".GoodNames").html("MomentCam Caricature (Digital)");
            }
        },
        Bind: function () {
        
            $(".CountNums").keyup(function () {
                this.value = this.value.replace(/[^\d]/g, '');
            }).change(function () {
                var num = Number($(".CountNums").val());
                console.log(Parameters.ProductStock);
                if (num > Parameters.ProductStock) {
                    num = Parameters.ProductStock;
                } else if (num <= 0) {
                    num = 1;
                }
                $(".CountNums").val(num);
                $(".Amount span").eq(1).html("x" + num);
                $(".TotlePrices span").eq(1).html("$" + (Number(ProductObj["Product"]["SalePrice"]) * Number(num)).toFixed(2));
                Parameters.BuyCount = num;
            });
            //减少商品
            $(".add").on("click", function () {
                if (Number($(".CountNums").val()) == 1) {
                    return;
                } else {
                    $(".add").css({ "cursor": "pointer" });
                }
                Parameters.BuyCount = Number($(".CountNums").val());
                var minNum = 1;
                if (Parameters.ProductStock == 0) {
                    minNum = 0;
                }
                if (Parameters.BuyCount <= minNum) {
                    Parameters.BuyCount = minNum;
                } else {
                    Parameters.BuyCount--;
                }
                if (Parameters.BuyCount > 1) {
                    $(".add").css({ "cursor": "pointer" });
                } else {
                    $(".add").css({ "cursor": "not-allowed" });
                }
                $(".CountNums").val(Parameters.BuyCount);
                $(".Amount span").eq(1).html("x"+Parameters.BuyCount);
                var price = 0;
                if (!ProductObj)
                    price = 9.99;
                else
                    price = ProductObj["Product"]["SalePrice"];
                $(".TotlePrices span").eq(1).html("$" + (Number(price) * Number($(".CountNums").val())).toFixed(2));
            });
            //增加商品
            $(".reduce").on("click", function () {
                Parameters.BuyCount = Number($(".CountNums").val());
                var limitCount = 0;
                var showinfo = "";
                if (ProductObj) {
                    if (Parameters.ProductStock > Parameters.LimitBuyCountPerOrder) {
                        limitCount = Parameters.LimitBuyCountPerOrder;
                        showinfo = "每件商品限购" + limitCount + "件";
                    } else {
                        limitCount = Parameters.ProductStock;
                        showinfo = "资源紧张，库存不足！";
                    }
                } else {
                    $(".add").css({"cursor": "not-allowed" });
                    limitCount = 1;
                }
                if (Parameters.BuyCount >= limitCount) {
                    Parameters.BuyCount = limitCount;
                } else {
                    Parameters.BuyCount++;
                }
                if (Parameters.BuyCount > 1 && ProductObj) {
                    $(".reduce").css({ "cursor": "pointer" });
                    $(".add").css({ "cursor": "pointer" });
                } else {
                    $(".add").css({"cursor": "not-allowed" });
                }
                $(".CountNums").val(Parameters.BuyCount);
                $(".Amount span").eq(1).html("x" + Parameters.BuyCount);
                var price = 0;
                if (!ProductObj)
                    price = 9.99;
                else
                    price = ProductObj["Product"]["SalePrice"];

                $(".TotlePrices span").eq(1).html("$" + ((Number(price)) * Number($(".CountNums").val())).toFixed(2));
            });
            $(".GoPay").on("click", function () {
                Cookies.set("ProductCount", $(".CountNums").val());
                $(".rightPartHalf").hide();
                $(".nextPart").css("display", "inline-block");
                $(".a").hide();
                $(".b").show();
                $(".AdressDetail").remove();
                $(".oLoading").hide();
                $(".AddressEditBox").trigger("click");
                Order.init();
            });
            $(".a").on("click", function () {
                window.parent.location.href = "../index.html?name=chooseItem&v="+Math.random();
                window.parent.history.pushState(null, null, "Index.html?name=chooseItem");
            });
            $(".b").on("click", function () {
                $(".nextPart").hide();
                $(this).hide();
                $(".a").show();
                $(".rightPartHalf").css("display", "inline-block");
            });
        },
        init: function () {
            this.Common();
            this.Bind();
        }
    };
    window.goOrder = goOrder
    var Product = { 
        GetProduct: function (pid) {
            if (Parameters.ProductSaver[pid]) {
                clickCheck = false;
                this.FetchProduct(Parameters.ProductSaver[pid]);
                return;
            }
            var _this = this;
            var AC = {};
            AC.Id = pid;
            AC.Language = "zh";
            AC.fromtype = "pc";
            AC.AppVersion = "3.9";
            jQuery.ajax({
                type: "post",
                async: true,
                dataType: "json",
                url: MomentCam.urls.getProductUrl,
                timeout: 25000,
                contentType: "application/json; charset=utf-8",
                cache: false,
                data: JSON.stringify(AC),
                success: function (result) {
                    console.log(result);
                    Parameters.ProductSaver[pid] = result;

                    ProductObj = result;
                    _this.FetchProduct(result);


                }
            });
        },
        FetchProduct: function (result, isVirtual) {
            Parameters.FinalProductId = result["Product"]["ProductId"];
            Parameters.SkuProduct = result["Product"].SkuGroup.SkuProduct;
            Parameters.LimitBuyCountPerOrder = result["Product"]["LimitBuyCountPerOrder"];
            Parameters.ProductStock = result["Product"]["ProductStock"];
            $(".GoodNames").html(result["Product"]["ProductName"]);
            $(".UnitPrices span").eq(1).html("$" + result["Product"]["SalePrice"]);
            $(".Amount span").eq(1).html("1");
            $(".TotlePrices span").eq(1).html("$" + Number(result["Product"]["SalePrice"]).toFixed(2));
            Cookies.set("FinalProductId", Parameters.FinalProductId);
            $(".specList").html('').show();
            if (result["Product"]["IsSpu"] == 0) {
                this.IsSKU = false;
                if (result["Product"]["MainProductId"] == 0) {
                    $(".specList").hide();
                    $(".GoPay").addClass("active");
                } else {
                    $(".GoPay").removeClass("active");
                    var obj = result["Product"]["SkuGroup"]["SellProps"];
                    for (var i = 0; i < obj.length; i++) {
                        var Models = '<div class="spec" ><label>' + obj[i]["PropName"] + ':</label><div class="specBox"><span></span><ul class="specModels" PropCode="' + obj[i]["PropCode"] + '"></ul></div></div>';
                        $(".specList").append(Models);
                        $(".spec").eq(i).find(".specModels").append($(obj[i].Props).map(function (i, v) {
                            return '<li id="' + v.Id + '" >' + v.PName + '</li>'
                        }).get().join('')).find('li').click(filter);
                    }
                }
            } else {
                this.IsSKU = true;
                $(".specList").show();
                var obj = result["Product"]["SkuGroup"]["SellProps"];
                for (var i = 0; i < obj.length; i++) {
                    var Models = '<div class="spec" ><label>' + obj[i]["PropName"] + ':</label><div class="specBox"><span></span><ul class="specModels" PropCode="' + obj[i]["PropCode"] + '"></ul></div></div>';
                    $(".specList").append(Models);
                    $(".spec").eq(i).find(".specModels").append($(obj[i].Props).map(function (i, v) {
                        return '<li id="' + v.Id + '" >' + v.PName + '</li>'
                    }).get().join('')).find('li').click(filter);
                }
            }
            $(".specBox span").each(function () {
                var _this = $(this);
                _this.html(_this.siblings("ul").find("li").eq(0).html()).attr("id", _this.siblings("ul").find("li").eq(0).attr("id"));
                _this.siblings("ul").find("li").eq(0).trigger("click");
            });
            $(".specBox span").on("click", function () {
                $(this).siblings("ul").toggle().end().toggleClass("active");
            });
            $(".specBox").hover(function () {
                $(this).find("ul").show().end().find("span").addClass("active");
            }, function () {
                $(this).find("ul").hide().end().find("span").removeClass("active");
            });
            function filter() {
                if ($(this).hasClass('disabled')) return;
                $(this).closest("ul").hide();
                $(this).parent().siblings("span").html($(this).html()).attr("id",$(this).attr("id")).removeClass("active");
                $(this).addClass('selected').siblings().removeClass('selected');
                var currentPropCode = $(this).closest(".specModels").attr('propcode');
                var selectedProps = [];
                $(".specModels").each(function () {
                    var selected = $(this).find('.selected');
                    if (selected.length > 0) {
                        selectedProps.push({ PropCode: $(this).attr('propcode'), PropValueId: selected.attr('id') });
                    }
                });
                $(".spec").each(function () {
                    var modelList = $(this).find('.specModels');
                    var propCode = modelList.attr('propcode');
                    if (currentPropCode == propCode) return;
                    modelList.find('li').each(function () {
                        $(this).removeClass("disabled");
                        var aId = $(this).attr('id');
                        if (!$(this).hasClass('selected')) {
                            var newArr = [];
                            for (var j = 0; j < selectedProps.length; j++) {
                                if (selectedProps[j].PropCode != propCode) {
                                    newArr.push(selectedProps[j]);
                                }
                            }
                            newArr.push({ PropCode: propCode, PropValueId: aId });
                            if (getSkuProductBySelectedProps(newArr).length == 0) {
                                $(this).removeClass('selected').addClass("disabled");
                            };
                        }
                    });
                });

                var SkuProps = Parameters.SkuProduct[0].SkuProps;
                isSelectAll = true;
                for (var i = 0; i < SkuProps.length; i++) {
                    var propCode = SkuProps[i].PropCode;
                    var fflag = $(".spec").find("[propcode='" + propCode + "']").find("li").hasClass('selected') ? $(".spec").find("[propcode='" + propCode + "']").find("li.selected").attr("id") : undefined;
                    if (!fflag) {
                        isSelectAll = false;
                        break;
                    }
                }

                if (isSelectAll) {
                    var b = [];
                    //$(".tips").html("请选择规格！").hide();
                    for (var i = 0; i < SkuProps.length; i++) {
                        var propCode = SkuProps[i].PropCode;
                        var fflag = $(".spec").find("[propcode='" + propCode + "']").find("li").hasClass('selected') ? $(".spec").find("[propcode='" + propCode + "']").find("li.selected").attr("id") : undefined;
                        var o = {};
                        o.name = SkuProps[i].PropCode;
                        o.id = fflag;
                        if (fflag)
                            b.push(o);
                    }
                    $(".GoPay").addClass("active");
                    var mainobject = Product.GetFinalProductId(b);
                    if (mainobject != null && mainobject.ProductStock > 0) {
                        Parameters.FinalProductId = mainobject.ProductId;
                        Cookies.set("FinalProductId", Parameters.FinalProductId);
                        Parameters.ProductNum = mainobject.ProductStock;
                        $(".UnitPrices span").eq(1).html("$" + ProductObj["Product"]["SalePrice"]);
                        $(".TotlePrices span").eq(1).html("$" + Number(ProductObj["Product"]["SalePrice"]) * Number($(".CountNums").val()).toFixed(2));
                    } else {
                        //$.dialog.tips("缺货");
                    }
                } else {
                    $(".Confirm").removeClass("active");
                    $(".UnitPrices span").eq(1).html("$" + ProductObj["Product"]["SalePrice"]);
                    $(".TotlePrices span").eq(1).html("$" + Number(ProductObj["Product"]["SalePrice"]) * Number($(".CountNums").val()).toFixed(2));
                }

                $('#Product a').each(function () {
                    hit = true;
                    for (var i = 0; i < SkuProps.length; i++) {
                        var propCode = SkuProps[i].PropCode;
                        var hflag = $(".spec").find("[propcode='" + propCode + "']").find("li").hasClass('selected') ? $(".spec").find("[propcode='" + propCode + "']").find("li.selected").attr("id") : undefined;
                        if (hit && hflag) {
                            hit = this.getAttribute(propCode) == hflag;
                        }
                    }
                    this.className = hit ? '' : 'disabled';
                    flag = false;           //购买不可选
                    if (isSelectAll) {
                        var vflag = true;
                        for (var i = 0; i < SkuProps.length; i++) {
                            var propCode = SkuProps[i].PropCode;
                            var value = this.getAttribute(propCode);
                            var cflag = $(".spec").find("[propcode='" + propCode + "']").find("li").hasClass('selected') ? $(".spec").find("[propcode='" + propCode + "']").find("li.selected").attr("id") : undefined;

                            if (value != cflag) {
                                vflag = false;
                                break;
                            }
                        }
                        if (vflag) {
                            if (this.getAttribute('productstock') == 0 || this.getAttribute('productstock') < Parameters.BuyCount) {
                                Order.Alert("库存不足，所选型号商品剩余" + this.getAttribute('productstock') + "件!");
                                $this.addClass('disabled');
                                flag = false;
                            } else {
                                flag = true;
                            }
                            return false;
                        }
                    }
                    // console.log("flag:" + flag);
                });
            }

            Parameters.MaskResult = result;
        },
        GetVirtualProduct: function (pid, reget) {
            ProductObj = null;
            $(".GoodName").html("MomentCam Caricature (Digital)");
            $(".reduce").css({ "background": "#f5f5f5", "cursor": "not-allowed" });
            $(".add").css({ "background": "#fbfbfb", "cursor": "not-allowed" });
            if (!$.isEmptyObject(Parameters.virtualObj)) {
                getVirtual(Parameters.virtualObj);
                return;
            }
            CallAjax(MomentCam.urls.getProductInfo, "id=" + pid, function (result) {
                getVirtual(result);
            });
            function isAO(str) {
                if (str instanceof Array || str instanceof Object) { return true }
                return false
            }
            function getVirtual(result) {
                if (isAO(result)) {

                    Parameters.virtualObj = result;
                } else {
                    result = JSON.parse(result);
                    Parameters.virtualObj = result;
                }

                // console.log(result);
                $(".UnitPrices span").eq(1).html("$" + result["price"]);
                $(".Amount span").eq(1).html("1");
                $(".TotlePrices span").eq(1).html("$" + Number(result["price"]).toFixed(2));
                //if (result["price"] != 0) {
                //    $(".Buy span").eq(0).html("$" + result["price"]).show();
                //}
                Cookies.set("FinalProductId", pid),
                Parameters.ProductID = pid;
                Parameters.FinalProductId = pid;
                $(".specList").html('').hide();
                if (reget) {
                    ConfirmOrder.init();
                }
            }
        },
        GetFinalProductId: function (arr) {
            var parents = Parameters.SkuProduct;
            for (var i = 0; i < parents.length; i++) {
                var mainobject = parents[i]; // a potential parent
                var temp = 0;
                for (var g = 0; g < arr.length; g++) {
                    for (var skuChild in mainobject.SkuProps) {
                        if (mainobject.SkuProps.hasOwnProperty(skuChild)) {
                            if (mainobject.SkuProps[skuChild].PropCode == arr[g].name && mainobject.SkuProps[skuChild].PropValueId == arr[g].id) {
                                temp++;
                                if (temp == arr.length) {
                                    return mainobject;
                                }
                            }
                        }
                    }
                }
            }
        },

    }

    function getSkuProductBySelectedProps(arr) {
        var ret = $.grep(Parameters.SkuProduct, function (sku) {
            var restarr = $.grep(arr, function (value) {
                return getProductPropValue(sku, value.PropCode) != value.PropValueId;
            });
            return restarr.length == 0 && sku.ProductStock > 0;
        });
        return ret;
    }

    function getProductPropValue(prod, propCode) {
        var ret = null;
        $(prod.SkuProps).each(function () {
            if (this.PropCode == propCode) {
                ret = this.PropValueId;
            }
        });
        return ret;
    }
})()
'use strict';
function GetUploadImage(f, type, callback) {
    var uploadImg = new Image();
    var canvas = null;
    var ctx = null;
    if (type == "upload") {
        window.URL = window.URL || window.webkitURL;
        uploadImg.src = window.URL.createObjectURL(f);
        canvas = document.getElementById("canvas");
    } else {
        canvas = document.getElementById("canvasCemara");
        uploadImg.src = canvas.toDataURL("image/png");
    }
    ctx = canvas.getContext("2d");
    var img = new Image();
    img.src = uploadImg.src;
    var _this = this;
    img.onload = function () {
        getOrientation(f, function (orientation) {
            var maxlength = 700;
            var oc = document.createElement('canvas'),
                octx = oc.getContext('2d');
            if (img.width >= img.height && img.width > maxlength) {
                oc.width = maxlength;
                oc.height = maxlength * img.height / img.width;

                oc.height = oc.height + (4 - (oc.height % 4 == 0 ? 4 : oc.height % 4));

            } else if (img.width < img.height && img.height > maxlength) {
                oc.height = maxlength;
                oc.width = maxlength * img.width / img.height;

                oc.width = oc.width + (4 - (oc.width % 4 == 0 ? 4 : oc.width % 4));
            } else {
                oc.width = img.width + (4 - (img.width % 4 == 0 ? 4 : img.width % 4));
                oc.height = img.height + (4 - (img.height % 4 == 0 ? 4 : img.height % 4));
            }
            octx.drawImage(img, 0, 0, oc.width, oc.height);
            octx.drawImage(oc, 0, 0, oc.width, oc.height);
            canvas.width = oc.width;
            canvas.height = oc.height;
            if (orientation == 8 || orientation == 6 || orientation == 3) {
                ctx.save();
                if (orientation == 8 || orientation == 6) {
                    canvas.width = oc.height;
                    canvas.height = oc.width;
                    if (orientation == 6) {
                        ctx.translate(oc.height, 0);
                    } else {
                        ctx.translate(0, oc.width);
                    }

                } else if (orientation == 3) {
                    ctx.translate(oc.width, oc.height);
                } else {
                    ctx.translate(oc.width, 0);
                }
                var deg;
                if (orientation == 8) {
                    deg = -90;
                } else if (orientation == 3) {
                    deg = -180;
                } else {
                    deg = 90;
                }
                ctx.rotate(deg * (Math.PI / 180));
                if (orientation == 3) {
                    ctx.drawImage(oc, 0, 0, oc.width, oc.height, 0, 0, canvas.width, canvas.height);
                } else {
                    ctx.drawImage(oc, 0, 0, oc.width, oc.height, 0, 0, canvas.height, canvas.width);
                }
                ctx.restore();
            } else {
                ctx.drawImage(oc, 0, 0, oc.width, oc.height,
                    0, 0, canvas.width, canvas.height);
            }
            var dataURL = canvas.toDataURL("image/jpeg");
            var blobBin = atob(dataURL.split(',')[1]);
            var array = [];
            for (var i = 0; i < blobBin.length; i++) {
                array.push(blobBin.charCodeAt(i));
            }
            var file = new Blob([new Uint8Array(array)], {
                type: 'image/jpeg'
            });
            var formData = new FormData();
            formData.append('file', file);
            formData.append("FilePurpose", "Photo");
            formData.append('filename', "file.jpeg");
            $.ajax({
                type: 'post',
                url: "https://imgupload.momentcam.net/api/Image/Upload",
                data: formData,
                timeout: 20000,
                success: function (result) {
                    return callback(result);
                },
                error: function (e) {
                    return callback(e);
                },
                processData: false,
                contentType: false,
            });
        });
    }
    function getOrientation(file, callback) {
        if (!file)
            return callback(-1);
        var reader = new FileReader();
        reader.onload = function (e) {
            var view = new DataView(e.target.result);
            if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
            var length = view.byteLength,
                offset = 2;
            while (offset < length) {
                var marker = view.getUint16(offset, false);
                offset += 2;
                if (marker == 0xFFE1) {
                    if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
                    var little = view.getUint16(offset += 6, false) == 0x4949;
                    offset += view.getUint32(offset + 4, little);
                    var tags = view.getUint16(offset, little);
                    offset += 2;
                    for (var i = 0; i < tags; i++)
                        if (view.getUint16(offset + (i * 12), little) == 0x0112)
                            return callback(view.getUint16(offset + (i * 12) + 8, little));
                } else if ((marker & 0xFF00) != 0xFF00) break;
                else offset += view.getUint16(offset, false);
            }
            return callback(-1);
        };
        reader.readAsArrayBuffer(file);
    }
}
(function(){var Order = {
    submitObj:{},
    Common: function () {
        $(".Quantity").html(Cookies.get("ProductCount"));
        if (Cookies.get("isRenderProduct") == "false") {
            var notProductInfo=JSON.parse(Cookies.get("Parameters"));
            $(".addressBox").hide();
            $(".PayTitle .Num").html("1");
            $(".UnitPrice").html("$" + notProductInfo.price);
            $(".ItemTotal").html("$" + notProductInfo.price);
            $(".Subtotal").html("$" + notProductInfo.price*1);
            $(".Discount").html("-$0");
            $(".Quantity").html("1");
            $(".ShipingFee").html("$0");
            $(".Total").html("$" + notProductInfo.price.toFixed(2));
            $(".GoodName").html("MomentCam Caricature (Digital)");
            $(".title,.Money").css("opacity", "1");
            $(".PayBox").removeClass("NoUsed").show();
            Order.submitVirtualProduct();
        } else {
            $(".addressBox,.PayBox").show();
            this.getAllAdress();
            this.GetTradeFlow(false);
        }
    },
    PayType:true,
    Bind: function () {
        $(".SaveBtn").off("click").on("click", function () {
            if (Order.IsInsertFlag) {
                $(".AdressDetail").attr("IsDefault","0");
                Order.insertAddress();
            } else {
                if (Order.UpdateAddrFlag) {
                    Order.UpdateAddr();
                } else {
                    $(".NewOrViewed").remove();
                    Order.GetTradeFlow(true);
                    //Order.saveConsignee();
                }
            }
            Order.UpdateAddrFlag = false;
        });
        $(".AddressEditBox").off("click").on("click", function () {
            if (Order.AddrBoxHeight != 0) {
                $(".addressTitle").addClass("Editing");
                $(".oLoading").hide();
                $(".PayBox").addClass("NoUsed");
                $(".addressBox").animate({ "height": Order.AddrBoxHeight }, 500, function () {
                    $(".addressBox").css("height", "auto");
                });
            }
        });

        $(".Clicked").off("click").on("click", function () {
            if ($(this).hasClass("choosed")) return;
            $(this).addClass("choosed").siblings(".Clicked").removeClass("choosed");
            $(".oLoading").hide();
            if ($(this).hasClass("CreaditCardBox")) {
                $(".InsertText").show();
                Order.PayType = true;
                $("#PayCard").show();
                $("#PayPal").hide();
                if (Order.PayCardFlag) {
                    $(this).find(".oLoading").show();
                    Order.InitPayParams(Order.submitObj);
                }
            } else {
                Order.PayType = false;
                $(".InsertText").hide();
                $("#PayCard").hide();
                $("#PayPal").show();
                if (Order.PayPalFlag) {
                    $(this).find(".oLoading").show();
                    Order.InitPayParams(Order.submitObj);
                }
            }
            
        });
            
        //点击新建地址按钮
        $(".CreatAdressBtn").off("click").on("click", function () {
            $(".NewOrViewed").remove();
            $(".AdressDetail").removeClass("choosed");
            var div = Order.CreatAddreDiv();
            $(this).hide();
            $(this).before(div);
            Order.InitMaterial();
            Order.IsInsertFlag = true;
            Order.UpdateAddrFlag = false;
            Order.GetAllRegionCode();
        });
        //使用优惠码
        $(".CodeSubmit").off("click").on("click", function () {
            if ($(".CodeBox input").val().length == 0) {
                return;
            }
            Order.CouponFlag = true;
            if (Cookies.get("isRenderProduct") == "false") {
                Order.checkCoupon();
            } else {
                Order.GetTradeFlow();
            }
        });
        //支付0元的跳转
        $("#zero").off("click").on("click", function () {
            if (Order.zeroFlag) {
                Order.zeroFlag = false;
                if (Order.checkCouponFlag) {
                    Order.submitVirtualProduct();
                } else {
                    window.location.href = "Pages/Success.html?v=" + Math.random();
                }
            } else {
                return;
            }
        });
        $("body").unbind("click").on("click", function () {
            window.parent.hiding($(this));
        });
    },
    zeroFlag:true,
    CouponFlag:false,
    SubmitOrder: function (isVirtual) {
        if (isVirtual)
            this.SubmitRealProductOrder();
        else
            this.submitVirtualProduct();
    },
    SubmitRealProductOrder: function () {

        var data = {
            Token: Cookies.get('TOKEN'),
            ProductId: Cookies.get("FinalProductId"),
            ProductCount: parseInt(Cookies.get("ProductCount")),
            RenderData: "[{CartoonCode:\"" + Cookies.get("CartoonCode")+ "02" + "\", DataUid:\"" + Cookies.get("DataUid") + "\"}]",
            ProductIconUrl: Cookies.get("ProductImg"),
            ProductTrace: "",
            OrderMsg: ""
        };
        CallAjax(MomentCam.urls.submitOrderUrl, data, function (result) {
            if (result.StatusCode == 0) {
                console.log(result);
                Order.submitObj = result;
                Cookies.set("result", result);
                if (result.PayableAmount == 0) {
                    $(".ChooseType .Clicked").hide();
                    $(".Nofee").show();
                    $(".PayNow").hide();
                    $("#zero").show();
                } else {
                    $(".ChooseType .Clicked").show();
                    if (Order.PayCardFlag) {
                        Order.InitPayParams(Order.submitObj);
                    }
                }
                var datas = {
                    ProductID: Cookies.get("FinalProductId"),
                    OrderNumber: result.OrderIds,
                    ProductName: $(".GoodName").html(),
                    ProductCount: parseInt(Cookies.get("ProductCount")),
                    Price: parseInt($(".UnitPrice").html()),
                    Address: $(".choosed .shipAddress").html(),
                    Customer: $(".choosed .topName").html(),
                    Tel: $(".choosed .SeePhone span").eq(1).html(),
                    Email: $(".choosed").attr("email"),
                    TplCode: 50006,
                    BGID: Cookies.get("CartoonCode"),
                    PayAmout: result.PayableAmount
                };
                Cookies.set('orderData', datas);
            } else {
                
                if (result.StatusCode == 111002) {
                    Order.Alert(result.Description);
                }
                // console.log("提交订单失败，请稍后再试");
            }
        });
    },
    SubmitVirtualOrder: function () {
        var extend = {
            OrderNumber: Order.submitObj.OrderIds,
            UserID: Cookies.get("UserId"),
            OrderType: parseInt(Cookies.get("ProductCount")),
            ProductCount: parseInt(Cookies.get("ProductCount")),
            ProductID: "444",
            ResourceNumber: Cookies.get("CartoonCode"),
            ProductName: "MomentCam Caricature (Digital)",
            UserImage: Cookies.get("ProductImg").split("?")[0],
            Thumbnail: Cookies.get("ProductImg").split("?")[0] + "?x-oss-process=image/resize,w_120"
        };
        var data = "language=en&fromtype=h5&appversion=100&extend=" + JSON.stringify(extend);
        CallAjax(MomentCam.urls.addusercartoonsorder, data, function (result) {
            console.log(result);
            if (result.StatusCode == "80000") {
                window.location.href = "Success.html";
            }
        });
        var datas = {
            Token: Cookies.get('TOKEN'),
            Email: $(".choosed").attr("email"),
            ProductId: Cookies.get("FinalProductId"),
            ProductCount: parseInt(Cookies.get("ProductCount")),
            RenderData: "[{CartoonCode:\"" + Cookies.get("CartoonCode") + "02" + "\", DataUid:\"" + Cookies.get("DataUid") + "\"}]"
        };
        Cookies.set('orderData', datas);
    },
    submitVirtualProduct: function () {
        var data = {
            Token: Cookies.get('TOKEN'),
            Email: "",
            ProductId: Cookies.get("FinalProductId"),
            ProductCount: parseInt(Cookies.get("ProductCount")),
            RenderData: "[{CartoonCode:\"" + Cookies.get("CartoonCode") + "02" + "\", DataUid:\"" + Cookies.get("DataUid") + "\"}]"
        };
        CallAjax(MomentCam.urls.submitVirtualProduct, data, function (result) {
            console.log(result);
            Order.submitObj = result;
            Cookies.set("result", result);
            if (Order.checkCouponFlag) {
                Order.SaveCouponOne(result.OrderIds);
                return;
            }
            if (result.PayableAmount == 0) {
                $(".ChooseType .Clicked").hide();
                $(".Nofee").show();
                $(".PayNow").hide();
                $("#zero").show();
            } else {
                $(".ChooseType .Clicked").show();
                if (Order.PayCardFlag)
                    Order.InitPayParams(Order.submitObj);
            }
        });
    },
    PayCardFlag: true,
    PayPalFlag: true,
    InitializationFlag:true,
    InitPayParams: function (obj) {
        PayOrder.ReturnUrl = "Success.html";
        PayOrder.ShowUrl = "../Index.html";
        PayOrder.Token = Cookies.get('TOKEN');
        PayOrder.CurrencyUnit = obj.CurrencyUnit;
        PayOrder.OrderInfo = obj.OrderInfo;
        PayOrder.PayType = obj.PaymentType;
        PayOrder.Payable = obj.PayableAmount;
        $(".Clicked").css("cursor", "not-allowed");
        if (Order.PayType) {
            $(".CreaditCardBox").find(".oLoading").show();
            PayOrder.PrepareCreditPay("#PayCard", function (e) {
                Order.PayCardFlag = false;
                $(".CreaditCardBox").find(".oLoading").hide();
                $(".InsertText").show();
                $("body").Loading("hide");
                if (Order.InitializationFlag) {
                    PayOrder.PreparePaypalPay("#PayPal", function (e) {
                        Order.PayPalFlag = false;
                        $(".PayPal").find(".oLoading").hide();
                        $("body").Loading("hide");
                    }, function (e) {
                        $(".PayPal").find(".oLoading").hide();
                        $("body").Loading("hide");
                        if (e.StatusCode == 1) {
                            if (e.Description.indexOf("Some payment input fields are invalid.") > -1) {
                                e.Description = "Your payment information is incorrect. Please check and try again.";
                            }
                            Order.Alert(e.Description ? e.Description : "Oops...Something went wrong.");
                        } else if (e.StatusCode == "-100") {
                            Order.Alert("Log in to continue.");
                        } else {
                            Order.Alert("Oops...Something went wrong. Error code:" + e.StatusCode);
                        }
                    });
                    Order.InitializationFlag = false;
                }
            }, function (e) {
                $(".CreaditCardBox").find(".oLoading").hide();
                if (Order.InitializationFlag) {
                    PayOrder.PreparePaypalPay("#PayPal", function (e) {
                        Order.PayPalFlag = false;
                        $(".PayPal").find(".oLoading").hide();
                        $("body").Loading("hide");
                    }, function (e) {
                        $(".PayPal").find(".oLoading").hide();
                        $("body").Loading("hide");
                    });
                    Order.InitializationFlag = false;
                }
            });
            $(".Clicked").css("cursor", "pointer");
        } else {
            $(".PayPal").find(".oLoading").show();
            $(".Clicked").css("cursor", "not-allowed");
            PayOrder.PreparePaypalPay("#PayPal", function (e) {
                Order.PayPalFlag = false;
                $("#PayCard").hide();
                $("#PayPal").show();
                $(".PayPal").find(".oLoading").hide();
                $("body").Loading("hide");
            }, function (e) {
                $(".PayPal").find(".oLoading").hide();
                $("body").Loading("hide");
                if (e.StatusCode == 1) {
                    Order.Alert(e.Description ? e.Description : "Oops...Something went wrong.");
                } else if (e.StatusCode == "-100") {
                    Order.Alert("Log in to continue.");
                } else {
                    Order.Alert("Oops...Something went wrong. Error code:" + e.StatusCode);
                }
            });
            $(".Clicked").css("cursor", "pointer");
        }
    },
    GetAllRegionCode: function (id) {
        CallAjax(MomentCam.urls.GetAllRegionCode, "Language=en", function (result) {
            console.log(result);
            Order.AllRegionCode = result;
            var Code = "", Country = "";
            for (var i = 0; i < Order.AllRegionCode.Regions.length; i++) {
                Code += "<option class='" + Order.AllRegionCode.Regions[i].Id + "'>" + Order.AllRegionCode.Regions[i].RegionCode + "</option>";
                Country += "<option class='" + Order.AllRegionCode.Regions[i].Id + "'>" + Order.AllRegionCode.Regions[i].Name + "</option>";
            }
            $(".CountyCode").html(Code).val($(".CountyCode option[class=40]").val());
            $(".CountyList").html(Country).val($(".CountyList option[class=40]").val());
            if (Order.UpdateAddrFlag) {
                Order.getAddr(id);
            }
            $(".CountyCode").change(function () {
                var id = $(this).find("option:selected").attr("class");
                $(".CountyList").val($(".CountyList option[class=" + id + "]").val());
            });
            $(".CountyList").change(function () {
                var id = $(this).find("option:selected").attr("class");
                $(".CountyCode").val($(".CountyCode option[class=" + id + "]").val());
            });
        });
    },
    checkCouponFlag:false,
    checkCoupon: function () {
        CallAjax(MomentCam.urls.checkCoupon, "code=" + $(".CodeBox input").val(), function (result) {
            if (result.StatusCode == 80008) {
                Order.code = $(".CodeBox input").val();
                $(".CodeBox input").val("");
                CallAjax(MomentCam.urls.getProductInfo, "id=444", function (result) {
                    console.log(result);
                    Order.CouponFlag = false;
                    Order.checkCouponFlag = true;
                    if (result.StatusCode == 80008) {
                        $(".Discount").html("-$9.99");
                        $(".Quantity").html("1");
                        $(".ShipingFee").html("$0");
                        $(".Total").html("$0");
                        $(".oLoading").hide();
                        Cookies.set("FinalProductId", "444");
                        $(".ChooseType .Clicked").hide();
                        $(".Nofee").show();
                        $(".PayNow").hide();
                        $("#zero").show(); 
                    }
                });
            } else {
                Order.Alert("Coupon number not avaliable");
            }
        })
    },
    code:0,
    SaveCouponOne: function (a) {
        var data = {
            code: Order.code,
            orderid: a,
            userid: Cookies.get("UserId")
        };
        CallAjax(MomentCam.urls.digitalCoupon, data, function (data) {
            console.log(data);
            if (data.StatusCode == 80008) {
                window.location.href = "Success.html";
                //Order.SubmitVirtualOrder();
            } else {
                Order.zeroFlag = true;
            }
        });
    },
    SaveCoupon: function () {
        var data = {
            Token: Cookies.get("TOKEN"),
            ProductId:Cookies.get("FinalProductId"),
            ProductCount: Cookies.get("ProductCount"),
            CouponCode: $(".CodeBox input").val(),
            DeviceId:1
        };
        CallAjax(MomentCam.urls.saveCoupon, data, function (data) {
            console.log(data);
            Order.CouponFlag = false;
            if (data.StatusCode == 0) {
                $(".CodeBox input").val("");
                $(".Discount").html("-$" + data.CouponAmount);
                $(".Total").html("$" + data.PayableAmount.toFixed(2));
                if (data.PayableAmount== 0) {
                    $(".ChooseType .Clicked").hide();
                    $(".Nofee").show();
                    $(".PayNow").hide();
                    $("#zero").show();
                } else {
                    $(".ChooseType .Clicked").show();
                    $(".Nofee").hide();
                }
                if (!$(".addressTitle").hasClass("Editing")) {
                    Order.SubmitOrder(Cookies.get("isRenderProduct"));
                }
            } else {
                if (data.StatusCode == "111012") {
                    Order.Alert("Invalid promo code");
                } else if (data.StatusCode == "111013") {
                    Order.Alert("This promo code has been used already");
                } else if (data.StatusCode == "111014") {
                    Order.Alert("This promo code cannot be used for this order");
                } else if (data.StatusCode == "111016") {
                    Order.Alert("This promo code has expired or is not currently valid");
                } else if (data.StatusCode == "111017") {
                    Order.Alert("This promo code cannot be used anymore");
                } else {
                    Order.Alert("Oops...Something went wrong. Error code:" + data.StatusCode);
                }
            }
        });
    },
    CreatAddreDiv: function () {
        var html = '<div class="NewOrViewed">' +
                        '<h3 style="line-height:20px;">New address</h3>' +
                        '<div id="tf-box-example" style="margin-right:10px;" class="mdc-textfield mdc-textfield--box mdc-textfield--upgraded mdc-ripple-upgraded mdc-textfield--invalid">'+
                            '<input type="text" id="tf-box" class="Email mdc-textfield__input" required="" aria-controls="name-validation-message">' +
                            '<label for="tf-box" class="mdc-textfield__label">Email</label>' +
                            '<div class="mdc-textfield__bottom-line"></div>'+
                        '</div>' +
                        //'<input class="Email" type="text" placeholder="Email" />' +
                        '<div id="tf-box-example" class="mdc-textfield mdc-textfield--box mdc-textfield--upgraded mdc-ripple-upgraded mdc-textfield--invalid">' +
                            '<input type="text" id="tf-box" class="Name mdc-textfield__input" required="" aria-controls="name-validation-message">' +
                            '<label for="tf-box" class="mdc-textfield__label">Recipient</label>' +
                            '<div class="mdc-textfield__bottom-line"></div>' +
                        '</div>' +
                        //'<input class="Name" type="text" placeholder="Recipient" />' +
                        '<div id="tf-box-example" style="margin-right:10px;" class="mdc-textfield mdc-textfield--box mdc-textfield--upgraded mdc-ripple-upgraded mdc-textfield--invalid">' +
                            '<input type="text" id="tf-box" class="Address mdc-textfield__input" required="" aria-controls="name-validation-message">' +
                            '<label for="tf-box" class="mdc-textfield__label">Address</label>' +
                            '<div class="mdc-textfield__bottom-line"></div>' +
                        '</div>' +
                        //'<input class="Address" type="text" placeholder="Address" />' +
                        '<div id="tf-box-example" class="mdc-textfield mdc-textfield--box mdc-textfield--upgraded mdc-ripple-upgraded mdc-textfield--invalid">' +
                            '<input type="text" id="tf-box" class="Apt mdc-textfield__input" required="" aria-controls="name-validation-message">' +
                            '<label for="tf-box" class="mdc-textfield__label">Apt/Suite</label>' +
                            '<div class="mdc-textfield__bottom-line"></div>' +
                        '</div>' +
                        //'<input class="Apt" type="text" placeholder="Apt/Suite" />' +
                        '<div id="tf-box-example" class="mdc-textfield mdc-textfield--box mdc-textfield--upgraded mdc-ripple-upgraded mdc-textfield--invalid">' +
                            '<input type="text" id="tf-box" class="City mdc-textfield__input" required="" aria-controls="name-validation-message">' +
                            '<label for="tf-box" class="mdc-textfield__label">City</label>' +
                            '<div class="mdc-textfield__bottom-line"></div>' +
                        '</div>' +
                        //'<input class="City" type="text" placeholder="City" />' +
                         '<div id="tf-box-example" style="margin:10px 10px 0;" class="mdc-textfield mdc-textfield--box mdc-textfield--upgraded mdc-ripple-upgraded mdc-textfield--invalid">' +
                            '<input type="text" id="tf-box" class="State mdc-textfield__input" required="" aria-controls="name-validation-message">' +
                            '<label for="tf-box" class="mdc-textfield__label">State/Province</label>' +
                            '<div class="mdc-textfield__bottom-line"></div>' +
                        '</div>' +
                        //'<input class="State" type="text" placeholder="State/Province" />' +
                        '<div id="tf-box-example" class="mdc-textfield mdc-textfield--box mdc-textfield--upgraded mdc-ripple-upgraded mdc-textfield--invalid">' +
                            '<input type="text" id="tf-box" class="ZipCode mdc-textfield__input" required="" aria-controls="name-validation-message">' +
                            '<label for="tf-box" class="mdc-textfield__label">Zip code</label>' +
                            '<div class="mdc-textfield__bottom-line"></div>' +
                        '</div>' +
                        //'<input class="ZipCode" type="text" placeholder="Zip code" />' +
                        '<div class="CountyCodeBox">' +
                            '<select class="CountyCode">' +

                            '</select>' +
                        '</div>' +
                        '<div id="tf-box-example" style="margin:10px 10px 0;" class="mdc-textfield mdc-textfield--box mdc-textfield--upgraded mdc-ripple-upgraded mdc-textfield--invalid">' +
                            '<input type="text" id="tf-box" class="PhoneNum mdc-textfield__input" required="" aria-controls="name-validation-message">' +
                            '<label for="tf-box" class="mdc-textfield__label">Phone number</label>' +
                            '<div class="mdc-textfield__bottom-line"></div>' +
                        '</div>' +
                        //'<input class="PhoneNum" type="text" placeholder="Phone number" />' +
                        '<div class="CountyListBox">' +
                            '<select class="CountyList">' +

                            '</select>' +
                        '</div>' +
                    '</div>';
        return html;
    },
    InitMaterial: function () {
        (function () {
            var tfs = document.querySelectorAll(
                '.mdc-textfield:not([data-demo-no-auto-js])'
            );
            for (var i = 0, tf; tf = tfs[i]; i++) {
                mdc.textfield.MDCTextfield.attachTo(tf);
            }
        })();
    },
    getAddr: function (AddrId) {
        var data = {
            token: Cookies.get("TOKEN"),
            Id: AddrId,
            Language: "en"
        };
        CallAjax(MomentCam.urls.getAddrUrl, data, function (result) {
            console.log(result);
            if (result.StatusCode == 0) {
                $(".PhoneNum").val(result.Addr.Mobile);
                $(".Email").val(result.Addr.Email);
                $(".Name").val(result.Addr.ShipName);
                $(".Address").val(result.Addr.AddrDetail);
                $(".Apt").val(result.Addr.AddrDetail1);
                $(".State").val(result.Addr.StateName);
                $(".City").val(result.Addr.IntlCityName);
                $(".CountyCode").val(result.Addr.RegionCode);
                $(".ZipCode").val(result.Addr.PostCode);
                $(".CountyList").val(result.Addr.CountryName);
                $(".edit.active").removeClass("active");
            } else {
                if (result.StatusCode == "-100") {
                    Order.Alert("Log in to continue.");
                } else{
                    Order.Alert("Oops...Something went wrong. Error code:" + result.StatusCode);
                };
            }
        });
    },
    SaveAddrId:0,
    AllAdress: [],
    getAllAdress: function () {
        var data = {
            token: Cookies.get("TOKEN"),
            Language: "en"
        };
        CallAjax(MomentCam.urls.getAllAdressUrl, data, function (result) {
            console.log(result);
            if (result.StatusCode == 0) {
                Order.AllAdress = result.AddrList;
                result.AddrList.sort(compare("IsDefault"));
                if (result.AddrList.length == 0) {
                    $(".CreatAdressBtn").trigger("click");
                } else {
                    var html = "";
                    var L = result.AddrList.length > 1 ? "2" : result.AddrList.length;
                    for (var i = 0; i < L; i++) {
                        html += '<div class="AdressDetail" email="' + result.AddrList[i].Email + '" AddrId = "' + result.AddrList[i].AddrId + '" IsDefault = "' + result.AddrList[i].IsDefault + '">' +
                                    '<div class="top">'+
                                        '<span class="topName">'+result.AddrList[i].ShipName+'</span>'+
                                        '<span class="Delete">Delete</span>'+
                                        '<span class="edit">Edit</span>'+
                                    '</div>'+
                                    '<p class="SeePhone">'+
                                        '<span>' + result.AddrList[i].RegionCode + '</span> ' +
                                        '<span>' + result.AddrList[i].Mobile + '</span>' +
                                    '</p>'+
                                    '<p class="shipAddress">' + result.AddrList[i].AddrDetail1 + ", " + result.AddrList[i].AddrDetail + ", " + result.AddrList[i].IntlCityName + ", " + result.AddrList[i].StateName + "." + '</p>' +
                                '</div>';
                        
                    }
                    $(".DetailList").prepend(html);
                    $(".AdressDetail").eq(0).addClass("choosed");
                    Order.SaveAddrId = $(".AdressDetail").eq(0).attr("AddrId");
                    $(".CreatAdressBtn").show();
                    //Order.saveConsignee();
                    //地址切换
                    $(".AdressDetail").off("click").on("click", function () {
                        if ($(this).hasClass("choosed")) return;
                        $(this).addClass("choosed").siblings(".AdressDetail").removeClass("choosed");
                        $(".NewOrViewed").remove();
                        Order.SaveAddrId = $(this).attr("AddrId");
                        Order.UpdateAddrFlag = false;
                        Order.IsInsertFlag = false;
                        $(".CreatAdressBtn").show();
                    });
                    //编辑地址
                    $(".edit").off("click").on("click", function () {
                        if ($(this).hasClass("active")) return;
                        $(".edit").removeClass("active");
                        $(this).addClass("active");
                        Order.IsDefault = $(this).parent().parent().attr("IsDefault");
                        Order.IsInsertFlag = false;
                        Order.UpdateAddrFlag = true;
                        $(this).parent().parent().addClass("choosed").siblings(".AdressDetail").removeClass("choosed");
                        $(".NewOrViewed").remove();
                        var div = Order.CreatAddreDiv();
                        $(this).parent().parent().after(div);
                        $(".NewOrViewed").find(".mdc-textfield__label").addClass("mdc-textfield__label--float-above");
                        Order.InitMaterial();
                        Order.UpdateAddrId = $(this).parent().parent().attr("AddrId");
                        Order.SaveAddrId = Order.UpdateAddrId;
                        Order.GetAllRegionCode(Order.UpdateAddrId);
                        //Order.getAddr(Order.UpdateAddrId);
                        return false;
                    });
                    //删除地址
                    $(".Delete").off("click").on("click", function () {
                        var id = $(this).parent().parent().attr("AddrId");
                        Order.deleteAddress(id);
                        return false;
                    });
                }
            } else {
                if (result.StatusCode == "-100") {
                    Order.Alert("Log in to continue.");
                } else {
                    Order.Alert("Oops...Something went wrong. Error code:" + result.StatusCode);
                };
            }
        });
    },
    IsInsertFlag:false,
    insertAddress: function () {
        var address = {
            token: Cookies.get("TOKEN"),
            CountryId: $(".CountyList option:selected").attr("class"),
            Mobile: $(".PhoneNum").val(),
            Email: $(".Email").val(),
            ShipName: $(".Name").val(),
            AddrDetail: $(".Address").val(),
            AddrDetail1: $(".Apt").val(),
            StateName: $(".State").val(),
            CityName: $(".City").val(),
            IsDefault: 1,
            AddrType: "2",
            RegionCode: $(".CountyCode").val(),
            PostCode: $(".ZipCode").val(),
            countryName: $(".CountyList").val()
        };
        CallAjax(MomentCam.urls.insertAddressUrl, address, function (result) {
            console.log(result);
            if (result.StatusCode == 0) {
                Order.IsInsertFlag = false;
                var html = '<div class="AdressDetail choosed" AddrId = "' + result.AddrId + '" IsDefault = "1">' +
                                '<div class="top">' +
                                    '<span class="topName">' + $(".Name").val() + '</span>' +
                                    '<span class="Delete">Delete</span>' +
                                    '<span class="edit">Edit</span>' +
                                '</div>' +
                                '<p class="SeePhone">' +
                                    '<span>' + $(".CountyCode").val() + '</span> ' +
                                    '<span>' + $(".PhoneNum").val() + '</span>' +
                                '</p>' +
                                '<p class="shipAddress">' + $(".Apt").val() + ", " + $(".Address").val() + ", " + $(".City").val() + ", " + $(".State").val() + "." + '</p>' +
                            '</div>';
                $(".AdressDetail").removeClass("choosed");
                $(".DetailList").prepend(html);
                $(".NewOrViewed").remove();
                $(".CreatAdressBtn").show();
                Order.SaveAddrId = result.AddrId;
                Order.saveConsignee();
                //地址切换
                $(".AdressDetail").off("click").on("click", function () {
                    if ($(this).hasClass("choosed")) return;
                    $(".edit").removeClass("active");
                    $(this).addClass("choosed").siblings(".AdressDetail").removeClass("choosed");
                    $(".NewOrViewed").remove();
                    Order.SaveAddrId = $(this).attr("AddrId");
                    Order.UpdateAddrFlag = false;
                    Order.IsInsertFlag = false;
                    $(".CreatAdressBtn").show();
                });
                //编辑地址
                $(".edit").off("click").on("click", function () {
                    if ($(this).hasClass("active")) return;
                    $(".edit").removeClass("active");
                    $(this).addClass("active");
                    Order.IsInsertFlag = false;
                    Order.UpdateAddrFlag = true;
                    Order.IsDefault = $(this).parent().parent().attr("IsDefault");
                    $(this).parent().parent().addClass("choosed").siblings(".AdressDetail").removeClass("choosed");
                    $(".NewOrViewed").remove();
                    var div = Order.CreatAddreDiv();
                    $(this).parent().parent().after(div);
                    $(".NewOrViewed").find(".mdc-textfield__label").addClass("mdc-textfield__label--float-above");
                    Order.InitMaterial();
                    Order.GetAllRegionCode();
                    Order.UpdateAddrId = $(this).parent().parent().attr("AddrId");
                    Order.SaveAddrId = Order.UpdateAddrId;
                    setTimeout(function () {
                        Order.getAddr(Order.UpdateAddrId);
                    }, 500);
                    return false;
                });
                //删除地址
                $(".Delete").off("click").on("click", function () {
                    var id = $(this).parent().parent().attr("AddrId");
                    Order.deleteAddress(id);
                    return false;
                });
            } else {
                if (result.StatusCode == "-100") {
                    Order.Alert("Log in to continue.");
                } else if (result.StatusCode == "113001") {
                    Order.Alert("Maximum number of addresses reached. Please delete some to add new addresses");
                } else if (result.StatusCode == "113005") {
                    Order.Alert("Please enter a valid phone number");
                } else if (result.StatusCode == "113007") {
                    Order.Alert("Please enter a valid recipient (special characters not accepted)");
                } else if (result.StatusCode == "113008") {
                    Order.Alert("Please enter a valid delivery address (special characters not accepted)");
                } else {
                    Order.Alert("Oops...Something went wrong. Error code:" + result.StatusCode);
                }
            }
        });
    },
    IsDefault:0,
    UpdateAddrId:0,
    UpdateAddrFlag: false,
    UpdateAddr: function () {
        var address = {
            token: Cookies.get("TOKEN"),
            Id:Order.UpdateAddrId,
            CountryId: $(".CountyList option:selected").attr("class"),
            Mobile: $(".PhoneNum").val(),
            Email: $(".Email").val(),
            ShipName: $(".Name").val(),
            AddrDetail: $(".Address").val(),
            AddrDetail1: $(".Apt").val(),
            StateName: $(".State").val(),
            CityName: $(".City").val(),
            IsDefault: Order.IsDefault,
            AddrType: "2",
            RegionCode: $(".CountyCode").val(),
            PostCode: $(".ZipCode").val(),
            countryName: $(".CountyList").val()
        };
        CallAjax(MomentCam.urls.updateAddressUrl, address, function (result) {
            console.log(result);
            if (result.StatusCode == 0) {
                var AddrId = Order.UpdateAddrId;
                var _ = $(".AdressDetail[AddrId='" + AddrId + "']");
                _.find(".topName").html($(".Name").val());
                _.find(".SeePhone span").eq(0).html($(".CountyCode").val());
                _.find(".SeePhone span").eq(1).html($(".PhoneNum").val());
                _.find(".shipAddress").html($(".Apt").val() + ", " + $(".Address").val() + ", " + $(".City").val() + ", " + $(".State").val() + ".");
                _.find(".NewOrViewed").remove();
                Order.UpdateAddrFlag = false;
                Order.saveConsignee();
            } else {
                if (result.StatusCode == "-100") {
                    Order.Alert("Log in to continue.");
                } else if (result.StatusCode == "113005") {
                    Order.Alert("Please enter a valid phone number");
                } else if (result.StatusCode == "113007") {
                    Order.Alert("Please enter a valid recipient (special characters not accepted)");
                } else if (result.StatusCode == "113008") {
                    Order.Alert("Please enter a valid delivery address (special characters not accepted)");
                } else {
                    Order.Alert("Oops...Something went wrong. Error code:" + result.StatusCode);
                }
            }
        });
    },
    saveConsignee: function () {
        var info = {
            Token: Cookies.get("TOKEN"),
            ProductId: Cookies.get("FinalProductId"),//Cookies.get("FinalProductId")
            ProductCount: parseInt(Cookies.get("ProductCount")),
            AddrId: Order.SaveAddrId,
            DeviceId: generateUUID()
        };
        CallAjax(MomentCam.urls.saveConsignee, info, function (data) {
            console.log(data);
            if (data.StatusCode == 0) {
                $(".Discount").html("-$" + data.CouponAmount);
                $(".ShipingFee").html("$" + data.Orders[0].ShippingFee);
                $(".Total").html("$" + data.PayableAmount.toFixed(2));
                Order.AddrBoxToggle();
                if (data.PayableAmount.toFixed(2) == 0) {
                    $(".ChooseType .Clicked").hide();
                    $(".Nofee").show();
                    $(".PayNow").hide();
                    $("#zero").show();
                } else {
                    $(".ChooseType .Clicked").show();
                    $(".Nofee").hide();
                }
                Order.SubmitOrder(Cookies.get("isRenderProduct"));
            } else {
                if (data.StatusCode == "-100") {
                    Order.Alert("Log in to continue.");
                } else if (data.StatusCode == "111011") {
                    Order.Alert("No delivery possible to this address");
                } else {
                    Order.Alert("Oops...Something went wrong. Error code:" + data.StatusCode);
                }
            }
        });
    },
    deleteAddress: function (id) {
        var info = {
            token: Cookies.get("TOKEN"),
            Id: id
        };
        CallAjax(MomentCam.urls.deleteAddressUrl, info, function (data) {
            console.log(data);
            if (data.StatusCode == 0) {
                $(".AdressDetail[AddrId$=" + id + "]").remove();
                if ($(".AdressDetail").length == 0) {
                    $(".CreatAdressBtn").trigger("click");
                }
            } else {
                if (data.StatusCode == "-100") {
                    Order.Alert("Log in to continue.");
                }else {
                    Order.Alert("Oops...Something went wrong. Error code:" + data.StatusCode);
                }
            }
        });
    },
    GetTradeFlow: function (a) {
        var data = {
            Token: Cookies.get("TOKEN"),
            ProductId: Cookies.get("FinalProductId"),//Cookies.get("FinalProductId")
            ProductCount: parseInt(Cookies.get("ProductCount")),
            FromType: MomentCam.config.platform,
            DeviceId: generateUUID(),
            Language: "en"
        };
        CallAjax(MomentCam.urls.getTradeFlow, data, function (result) {
            console.log(result);
            if (result.StatusCode == 0) {
                $(".UnitPrice").html("$" + result.Orders[0].Products[0].SalePrice);
                $(".ItemTotal").html("$" + result.Orders[0].Products[0].SalePrice);
                $(".Subtotal").html("$" + result.Orders[0].SalePriceTotal);
                $(".Discount").html("-$" + result.CouponAmount);
                $(".Quantity").html(Cookies.get("ProductCount"));
                $(".ShipingFee").html("$" + result.Orders[0].ShippingFee);
                $(".Total").html("$" + result.PayableAmount.toFixed(2));
                $(".GoodName").html(result.Orders[0].Products[0].ProductName);
                if (Order.CouponFlag) {
                    Order.SaveCoupon();
                }
                if (a) {
                    Order.saveConsignee();
                }
            } else if (result.StatusCode == 111000) {
                Order.Alert("Oops...Something went wrong. Error code:" + result.StatusCode);
            } else if (result.StatusCode == -100) {
                Order.Alert("Log in to continue");
            } else if (result.StatusCode == 111001) {
                Order.Alert("Oops...Something went wrong. Error code:" + result.StatusCode);
            } else if (result.StatusCode == 111007) {
                Order.Alert("This product does not exist or is not available anymore");
            } else if (result.StatusCode == 111008) {
                Order.Alert("This product is out of stock at the moment");
            } else if (result.StatusCode == 111009) {
                Order.Alert("This product is sold out");
            } else if (result.StatusCode == 111010) {
                Order.Alert("Maximum purchase amount exceeded");
            } else {
                Order.Alert("Network unaliable, please try again");
            }

        });
    },
    AddrBoxHeight:0,
    AddrBoxToggle: function () {
        Order.AddrBoxHeight = $(".addressBox").height();
        $(".addressBox").animate({ "height": "32px" }, 500, function () {
            $(".addressTitle").removeClass("Editing");
            $(".PayBox").removeClass("NoUsed");
        });
    },
    Alert: function (str) {
        $("#mdc-dialog-default").find("#mdc-dialog-default-description").html(str);
        $("#default-dialog-activation").trigger("click");
    },
    init: function () {
        this.Common();
        this.Bind();
    },

}
    window.Order = Order

    //比较器
    function compare(propertyName) {
        return function (object1, object2) {
            var value1 = object1[propertyName];
            var value2 = object2[propertyName];
            if (value1 < value2) {
                return 1;
            } else if (value1 > value2) {
                return -1;
            } else {
                return 0;
            }
        };
    }

    function generateUUID() { // Public Domain/MIT 
        var d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
})()
var POP = (function () {
    var Pop = {
        isInit:false,
        setinterval: 0,
        loadingText: ["Use a clear picture from a front angle", "MomentCam has over 350 million users worldwide", "MomentCam was the recipient of the Facebook FbStart App of the Year 2015", "Avatar being created"],
        ShowLoading: function () {
            var i = 0;
            var _ = this;
            $("body").Loading(_.loadingText[0]);
            this.setinterval = setInterval(function () {
                if (i == 3)
                    i = 0;
                i++;
                $("body").Loading(_.loadingText[i]);
            }, 1500);
        },
        CloseLoading: function () {
            $("body").Loading("hide");
            $(".loading").hide();
            clearTimeout(this.setinterval);
        },
        Alert: function (str) {
            $("#mdc-dialog-default").css("opacity","1").find("#mdc-dialog-default-description").html(str);
            $("#default-dialog-activation").trigger("click");
        },
        displayControl: function (index,tag) {
            $("#part" + index).css("display", "block").siblings().hide();
            if (index == 1) {
                $(".BeautyLeft").css("display", "block");
                $(".ProductLeft").css("display", "none");
                $(".buttonGroup .a").show();
                $(".buttonGroup .b").hide();
                $(".resetGroup .a").hide();
            }
            if (index == 2) {
                $(".BeautyLeft").css("display", "none");
                $(".ProductLeft").css("display", "block");
                $(".buttonGroup .b").show();
                $(".buttonGroup .a").hide();
                $(".resetGroup .a").show();
                ProductThumb.init(tag);
                Theme.init(tag);
            } else {

            }
        },
        ShowLogin:function(callback){
            window.parent.showing(callback);
            return callback;
        },
        StartLoading: function () {
            if ($(".loading").css("display") == "none") {
                $(".loading").fadeIn();
                $("[name='renderResult']").attr("src", "")
            }
        },
        CheckLogin: function () {
            var dtd = $.Deferred();
            setTimeout(function () {
                var user = Cookies.get("user");
                if (user) {
                    user = JSON.parse(user);
                    var token = user.Token;
                    CallAjax(MomentCam.urls.checkUser, "TOKEN=" + token, function (r) {
                        if (r.StatusCode == 0) {
                            dtd.resolve();
                        } else {
                            dtd.reject();
                        }

                    });
                } else {
                    dtd.reject();
                }
            }, 200);
            return dtd.promise();
        },
    }

    return Pop;
})();
var noFavorite = false;
var ProductThumb = (function () {
    function init(tag) {
        renderProductThumb(tag);
        GetAllThemes();
    }
    function renderProductThumb(t) {
        if (t)
            return;
        $(".productContainer .swiper-slide").eq(0).addClass("active");
        ProductHandler.GetVirtualProduct(MomentCam.urls.VirtualID);
        $(".productContainer .swiper-slide").unbind("click").on("click", function () {
            if (!Parameters.clickCheck || $(this).hasClass("active"))
                return;
            if ($(this).index() == 0) {
                $(".add").css("cursor", "not-allowed").unbind("click");;

            } else {
                $(".add").css("cursor", "pointer").bind("click");
            }

            $(".CountNum").html("1");
            $(this).addClass("active").siblings().removeClass("active");
            var id = $(this).find("img").attr("data-id");
            if (id) {
                Parameters.clickCheck = false;
                Parameters.isRenderProduct = true;
                ProductHandler.GetProduct(id);
            }
            else {
                Parameters.FinalProductId = 424;
                Parameters.isRenderProduct = false;
                comicButtonEvent();
            }
        });
    }
    function GetAllThemes() {
        if (Parameters.RandomThemesID.length == 0) {
            var data = "language=zh&fromtype=android&appversion=1.0&coreid=5&parid=0&dataversion=1"
            CallAjax(MomentCam.urls.getallthemeUrl, data, function (result) {
                //console.log(result);
                //console.log(result["RootListJson"])
                result = result["RootListJson"].filter(function (obj) {
                    return obj.Name == "大分类";
                });
                //console.log(result);
                result = result[0].StemsListJson;
                for (var property in result) {
                    if (result.hasOwnProperty(property)) {
                        Parameters.RandomThemesID.push(result[property].tid);
                    }
                }
            });
        }
    }
    return {
        init: init
    };
})();
var Theme = (function () {
    var themeCache = {};
    function init() {
        ClickBind();
        callData(238);
    }

    function ClickBind() {
        $(".themeNav li").on("click", function (e) {
            e.stopPropagation();
            if ($(this).hasClass("active"))
                return;
            var index = $(this).index();
            if (index != 0) {
                $(this).addClass("active").siblings().removeClass("active").removeClass("themeActive");
            } else {
                $(this).addClass("themeActive");
                $(".themeNav li").removeClass("active");
            }
            $("#autocomplete").val('');
            switch (index) {
                case 0: {
                    if (!Parameters.clickCheck)
                        return;
                    Parameters.clickCheck = false;
                    var id = Parameters.RandomThemesID[randomIntFromInterval(0, Parameters.RandomThemesID.length)];
                    function randomIntFromInterval(min, max) {
                        return Math.floor(Math.random() * (max - min + 1) + min);
                    }
                    callData(id);
                    $(this).siblings().removeClass("active");
                    $(".themeNav .mdc-tab-bar__indicator").hide();
                    break;
                }
                case 1: {
                    $(".themeNav .mdc-tab-bar__indicator").show();
                    callData(238);
                    break;
                }
                case 2: {
                    $(".themeNav .mdc-tab-bar__indicator").show();
                    if (noFavorite) {
                        $(".themeThumbWrapper").hide()
                        $("#noFavoriteTip").show();
                        return;
                    }
                    $.when(POP.CheckLogin()).done(function () {
                        GetFavorite();
                    }).fail(function () {
                        POP.ShowLogin(function () {
                            GetFavorite();
                        });
                    });
                    break;
                }
                case 3: {
                    break;
                }
            }
        });
    }
    function GetFavorite() {
        var id = "800";
        if (!themeCache[id])
            themeCache[id] = {};

        if (themeCache[id][Parameters.Gender] == null) {
            var d = "token=" + Cookies.get('TOKEN') + "&themeid=1"
            CallAjax(MomentCam.urls.GetFavoriteUrl, d, function (result) {
                //console.log(result);
                if (result.StatusCode == "18008") {
                    if (result.Items.length > 0) {
                        var o = {};
                        o.ResourceLst = [];

                        var h = result.Items;
                        for (var i = 0; i < h.length; i++) {
                            var j = {};
                            j.ICOPath = "Images/MomentCamColorV3/background/" + h[i].ResNumber + "03";
                            j.Name = h[i].ResNumber;
                            o.ResourceLst.push(j);
                        }
                        renderDom(o, "800");
                    } else {
                        noFavorite = true;
                        $(".themeThumbWrapper").hide()
                        $("#noFavoriteTip").show();
                    }
                }
            });
        } else {
            //console.log("缓存过了");
            renderDom(themeCache[id][Parameters.Gender]);
            $("body").Loading("hide");
        }
    }
    function callData(id) {
        $("#noFavoriteTip").hide();
        $('.themeThumbWrapper').show()
        if (!themeCache[id])
            themeCache[id] = {};
        var _this = this;
        if (themeCache[id][Parameters.Gender] == null) {
            var IdObj = {};
            IdObj.localtime = "";
            IdObj.test = "";
            IdObj.language = "zh";
            IdObj.fromtype = "android";
            IdObj.appversion = "3.9";
            IdObj.themeid = id;
            IdObj.coreid = 5;
            CallAjax(MomentCam.urls.getresourceUrl, "language=zh&fromtype=android&appversion=80&extend=" + JSON.stringify(IdObj), function (result) {
                //console.log(result);
                renderDom(result, id);

            });
        } else {
            //console.log("缓存过了");
            renderDom(themeCache[id][Parameters.Gender]);
            $("body").Loading("hide");
        }
    }
    function renderDom(result, id, search) {
        Parameters.BGID = "";
        var firstID = "";
        if (Parameters.swiperObj["bg"]) {
            Parameters.swiperObj["bg"].setWrapperTranslate(0);
            Parameters.swiperObj["bg"].destroy();
        }
        var imgPathr_Arr = [];
        var imgId_Arr = [];
        var html = "";
        var container = $("#themeContainer");
        container.find(".swiper-wrapper").html('');
        var endName = MomentCam.config.isSupportWebp ? "?x-oss-process=image/format,webp/quality,q_80" : "";
        var aa = [];
        for (var i = 0; i < result.ResourceLst.length ; i++) {
            var gender = result.ResourceLst[i].Name.substr(3, 1);
            var comicPath = result.ResourceLst[i].ICOPath;
            var lastSlash = comicPath.lastIndexOf("/");
            comicPath = comicPath.substring(lastSlash + 1);
            comicPath = comicPath.substring(0, comicPath.length - 2);
            if (search && !comicPath.startWith("004") && !comicPath.startWith("006")) {
                aa.push(result.ResourceLst[i].Name);
                Parameters.BGID = aa[0];
                imgId_Arr.push(result.ResourceLst[i].Name);
                imgPath = Parameters.config.ImagePrefix + result.ResourceLst[i].ICOPath + endName;
                imgPathr_Arr.push(imgPath);
            } else {
                if (!Parameters.BGID && (!comicPath.startWith("004") && !comicPath.startWith("006")) && (Parameters.Gender == gender))
                    Parameters.BGID = result.ResourceLst[i].Name;
                if (!comicPath.startWith("004") && !comicPath.startWith("006") && (Parameters.Gender == gender)) {
                    imgId_Arr.push(result.ResourceLst[i].Name);
                    imgPath = Parameters.config.ImagePrefix + result.ResourceLst[i].ICOPath + endName;
                    imgPathr_Arr.push(imgPath);
                }
            }
        }
        var html = '';
        for (var i = 0; i < imgPathr_Arr.length; i++) {
            html += '<div class="iconWrapper"><img src="' + imgPathr_Arr[i] + '" id="' + imgId_Arr[i] + '"/></div>';
        }
        if (imgPathr_Arr == 0) {
            html = "<p style='width:100%;position:absolute;left:0;top:45%;text-align:center;font-size:14px;color:#999;'>Can't find the keyword, You may like these</p>";
        }
        container.find(".swiper-wrapper").append('<div class="swiper-slide" style="position:relative;">' + html + '</div>');

        var resultOne = "", resultTwo = "";
        $.each(container.find(".iconWrapper"), function (i, e) {
            resultOne += " " + checkInView($(e), false, container);
            resultTwo += " " + checkInView($(e), true, container);
        });
        var firstWord = resultOne.substr(0, 4), endWord = resultOne.substr(resultOne.length - 4);
        //console.log(firstWord + endWord);
        changeBtn(firstWord, endWord, container);
        $("#themeContainer .swiper-container-assets").scroll(function () {
            var resultOne = "", resultTwo = "";
            $.each(container.find(".iconWrapper"), function (i, e) {
                resultOne += " " + checkInView($(e), false, container);
                resultTwo += " " + checkInView($(e), true, container);
            });
            var firstWord = resultOne.substr(0, 4), endWord = resultOne.substr(resultOne.length - 4);
            //console.log(firstWord + endWord);
            changeBtn(firstWord, endWord, container);
        });




        $("#themeContainer .iconWrapper").eq(0).find("img").eq(0).addClass("active");
        if (!themeCache[id])
            themeCache[id] = {};
        themeCache[id][Parameters.Gender] = result;
        POP.StartLoading();
        $("#themeContainer img").unbind("click").bind("click", comicButtonEvent);
        if (Parameters.isRenderProduct) {
            CarouseFigureMask(Parameters.MaskResult);
        } else {
            GoRender(Parameters.BGID, function () {
                Parameters.clickCheck = true;
            });
        }
    }
    var Search = {
        getSearch: function (result, id, search) {
            console.log(result);
            renderDom(result, id, search);
        }
    }
    return {
        search: Search,
        init: init
    };
})();
function changeBtn(firstWord, endWord, container) {
    if (firstWord == " tru" && endWord == "true") {
        container.siblings(".swiper-button-prev").css({ "background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_disabled.png)", "background-size": "cover" });
        container.siblings(".swiper-button-next").css({ "background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_disabled.png)", "background-size": "cover" });
    } else if (firstWord == " tru" && endWord != "true") {
        container.siblings(".swiper-button-prev").css({ "background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_disabled.png)", "background-size": "cover" });
        container.siblings(".swiper-button-next").css({ "background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_normal.png)", "background-size": "cover" });
    } else if (firstWord != " tru" && endWord == "true") {
        container.siblings(".swiper-button-prev").css({ "background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_normal.png)", "background-size": "cover" });
        container.siblings(".swiper-button-next").css({ "background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_disabled.png)", "background-size": "cover" });
    } else if (firstWord != " tru" && endWord != "true") {
        container.siblings(".swiper-button-prev").css({ "background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_normal.png)", "background-size": "cover" });
        container.siblings(".swiper-button-next").css({ "background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_normal.png)", "background-size": "cover" });
    }
}
function changeBtns(firstWord, endWord, container) {
    if (firstWord == " tru" && endWord == "true") {
        container.parent().siblings(".swiper-button-prev").css("background-image", "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_disabled.png)");
        container.parent().siblings(".swiper-button-next").css("background-image", "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_disabled.png)");
    } else if (firstWord == " tru" && endWord != "true") {
        container.parent().siblings(".swiper-button-prev").css("background-image", "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_disabled.png)");
        container.parent().siblings(".swiper-button-next").css("background-image", "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_normal.png)");
    } else if (firstWord != " tru" && endWord == "true") {
        container.parent().siblings(".swiper-button-prev").css("background-image", "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_normal.png)");
        container.parent().siblings(".swiper-button-next").css("background-image", "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_disabled.png)");
    } else if (firstWord != " tru" && endWord != "true") {
        container.parent().siblings(".swiper-button-prev").css("background-image", "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_normal.png)");
        container.parent().siblings(".swiper-button-next").css("background-image", "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_normal.png)");
    }
}
function checkInView(elem, partial, container) {
    //var container = $("#topAssetsContainer");
    var contHeight = container.width();
    var contTop = container.scrollLeft();
    var contBottom = contTop + contHeight;

    var elemTop = $(elem).offset().left - container.offset().left;
    var elemBottom = elemTop + $(elem).width();

    var isTotal = (elemTop >= 0 && elemBottom <= contHeight);
    var isPart = ((elemTop < 0 && elemBottom > 0) || (elemTop > 0 && elemTop <= container.width())) && partial;

    return isTotal || isPart;
}
var ProductHandler = {
    GetProduct: function (pid) {
        $(".add").css({ "background": "#fbfbfb", "cursor": "pointer" });
        if (Parameters.ProductSaver[pid]) {
            Parameters.clickCheck = true;
            this.DealProduct(Parameters.ProductSaver[pid]);
            return;
        }
        var _this = this;
        var AC = {};
        AC.Id = pid;
        AC.Language = "zh";
        AC.fromtype = "pc";
        AC.AppVersion = "3.9";
        jQuery.ajax({
            type: "post",
            async: true,
            dataType: "json",
            url: MomentCam.urls.getProductUrl,
            timeout: 25000,
            contentType: "application/json; charset=utf-8",
            cache: false,
            data: JSON.stringify(AC),
            success: function (result) {
                //console.log(result);
                Parameters.ProductSaver[pid] = result;

                ProductObj = result;
                _this.DealProduct(result);


            }
        });
    },
    DealProduct: function (result, isVirtual) {
        try {
            Parameters.FinalProductId = result["Product"]["ProductId"];
        } catch (e) {
            Parameters.clickCheck = true;
        }
        Parameters.SkuProduct = result["Product"].SkuGroup.SkuProduct;
        Parameters.LimitBuyCountPerOrder = result["Product"]["LimitBuyCountPerOrder"];
        Parameters.ProductStock = result["Product"]["ProductStock"];
        $(".UnitPrice span").eq(1).html("$" + result["Product"]["SalePrice"]);
        $(".rightPart span").eq(0).html("$" + result["Product"]["SalePrice"]);
        $(".CountNum").html("1");
        $(".TotlePrice span").eq(1).html("$" + Number(result["Product"]["SalePrice"]).toFixed(2));
        $(".Buy span").eq(0).html("$" + result["Product"]["SalePrice"]).show();
        Cookies.set("FinalProductId", Parameters.FinalProductId);
        $(".specList").html('').show();
        if (result["Product"]["IsSpu"] == 0) {
            this.IsSKU = false;
            if (result["Product"]["MainProductId"] == 0) {
                $(".specList").hide();
                $(".Confirm").addClass("active");
            } else {
                $(".Confirm").removeClass("active");
                var obj = result["Product"]["SkuGroup"]["SellProps"];
                for (var i = 0; i < obj.length; i++) {
                    var Models = '<div class="spec" ><h3>' + obj[i]["PropName"] + '</h3><div class="specModels" PropCode="' + obj[i]["PropCode"] + '"></div></div>';
                    $(".specList").append(Models);
                    $(".spec").eq(i).find(".specModels").append($(obj[i].Props).map(function (i, v) {
                        return '<a id="' + v.Id + '" href="javascript:void(0);" >' + v.PName + '</a>'
                    }).get().join('')).find('a').click(filter);
                }
            }
        } else {
            this.IsSKU = true;
            $(".specList").show();
            var obj = result["Product"]["SkuGroup"]["SellProps"];
            for (var i = 0; i < obj.length; i++) {
                var Models = '<div class="spec" ><h3>' + obj[i]["PropName"] + '</h3><div class="specModels" PropCode="' + obj[i]["PropCode"] + '"></div></div>';
                $(".specList").append(Models);
                $(".spec").eq(i).find(".specModels").append($(obj[i].Props).map(function (i, v) {
                    return '<a id="' + v.Id + '" href="javascript:void(0);" >' + v.PName + '</a>'
                }).get().join('')).find('a').click(filter);
            }
        }
        function filter() {
            if ($(this).hasClass('disabled')) return;
            $(this).toggleClass('selected').siblings().removeClass('selected');
            var currentPropCode = $(this).closest(".specModels").attr('propcode');
            var selectedProps = [];
            $(".specModels").each(function () {
                var selected = $(this).find('.selected');
                if (selected.length > 0) {
                    selectedProps.push({ PropCode: $(this).attr('propcode'), PropValueId: selected.attr('id') });
                }
            });
            $(".spec").each(function () {
                var modelList = $(this).find('.specModels');
                var propCode = modelList.attr('propcode');
                if (currentPropCode == propCode) return;
                modelList.find('a').each(function () {
                    $(this).removeClass("disabled");
                    var aId = $(this).attr('id');
                    if (!$(this).hasClass('selected')) {
                        var newArr = [];
                        for (var j = 0; j < selectedProps.length; j++) {
                            if (selectedProps[j].PropCode != propCode) {
                                newArr.push(selectedProps[j]);
                            }
                        }
                        newArr.push({ PropCode: propCode, PropValueId: aId });
                        if (getSkuProductBySelectedProps(newArr).length == 0) {
                            $(this).removeClass('selected').addClass("disabled");
                        };
                    }
                });
            });

            var SkuProps = Parameters.SkuProduct[0].SkuProps;
            isSelectAll = true;
            for (var i = 0; i < SkuProps.length; i++) {
                var propCode = SkuProps[i].PropCode;
                var fflag = $(".spec").find("[propcode='" + propCode + "']").find("a").hasClass('selected') ? $(".spec").find("[propcode='" + propCode + "']").find("a.selected").attr("id") : undefined;
                if (!fflag) {
                    isSelectAll = false;
                    break;
                }
            }

            if (isSelectAll) {
                var b = [];
                //$(".tips").html("请选择规格！").hide();
                for (var i = 0; i < SkuProps.length; i++) {
                    var propCode = SkuProps[i].PropCode;
                    var fflag = $(".spec").find("[propcode='" + propCode + "']").find("a").hasClass('selected') ? $(".spec").find("[propcode='" + propCode + "']").find("a.selected").attr("id") : undefined;
                    var o = {};
                    o.name = SkuProps[i].PropCode;
                    o.id = fflag;
                    if (fflag)
                        b.push(o);
                }
                $(".Confirm").addClass("active");
                var mainobject = ProductHandler.GetFinalProductId(b);
                if (mainobject != null && mainobject.ProductStock > 0) {
                    Parameters.FinalProductId = mainobject.ProductId;
                    Cookies.set("FinalProductId", Parameters.FinalProductId);
                    Parameters.ProductNum = mainobject.ProductStock;
                    $(".UnitPrice span").eq(1).html("$" + ProductObj["Product"]["SalePrice"]);
                    $(".TotlePrice span").eq(1).html("$" + Number(ProductObj["Product"]["SalePrice"]) * Number($(".CountNum").html()).toFixed(2));
                } else {
                    //$.dialog.tips("缺货");
                }
            } else {
                $(".Confirm").removeClass("active");
                $(".UnitPrice span").eq(1).html("$" + ProductObj["Product"]["SalePrice"]);
                $(".TotlePrice span").eq(1).html("$" + Number(ProductObj["Product"]["SalePrice"]) * Number($(".CountNum").html()).toFixed(2));
            }


            $('#Product a').each(function () {
                hit = true;
                for (var i = 0; i < SkuProps.length; i++) {
                    var propCode = SkuProps[i].PropCode;
                    var hflag = $(".spec").find("[propcode='" + propCode + "']").find("a").hasClass('selected') ? $(".spec").find("[propcode='" + propCode + "']").find("a.selected").attr("id") : undefined;
                    if (hit && hflag) {
                        hit = this.getAttribute(propCode) == hflag;
                    }
                }
                this.className = hit ? '' : 'disabled';
                flag = false;           //购买不可选
                if (isSelectAll) {
                    var vflag = true;
                    for (var i = 0; i < SkuProps.length; i++) {
                        var propCode = SkuProps[i].PropCode;
                        var value = this.getAttribute(propCode);
                        var cflag = $(".spec").find("[propcode='" + propCode + "']").find("a").hasClass('selected') ? $(".spec").find("[propcode='" + propCode + "']").find("a.selected").attr("id") : undefined;

                        if (value != cflag) {
                            vflag = false;
                            break;
                        }
                    }
                    if (vflag) {
                        if (this.getAttribute('productstock') == 0 || this.getAttribute('productstock') < Parameters.BuyCount) {
                            $.dialog.tips("库存不足，所选型号商品剩余" + this.getAttribute('productstock') + "件!");
                            $this.addClass('disabled');
                            flag = false;
                        } else {
                            flag = true;
                        }
                        return false;
                    }
                }
                // console.log("flag:" + flag);
            });
        }

        Parameters.MaskResult = result;
        if (Parameters.isRenderProduct) {
            CarouseFigureMask(result);
        }
    },
    GetVirtualProduct: function (pid, reget) {
        ProductObj = null;
        $(".GoodName").html("MomentCam Caricature (Digital)");
        $(".reduce").css({ "background": "#f5f5f5", "cursor": "not-allowed" });
        $(".add").css({ "background": "#fbfbfb", "cursor": "not-allowed" });
        if (!$.isEmptyObject(Parameters.virtualObj)) {
            getVirtual(Parameters.virtualObj);
            return;
        }
        CallAjax(MomentCam.urls.getProductInfo, "id=" + pid, function (result) {
            getVirtual(result);
        });
        function isAO(str) {
            if (str instanceof Array || str instanceof Object) { return true }
            return false
        }
        function getVirtual(result) {
            if (isAO(result)) {

                Parameters.virtualObj = result;
            } else {
                result = JSON.parse(result);
                Parameters.virtualObj = result;
            }

            // console.log(result);
            $(".UnitPrice span").eq(1).html("$" + result["price"]);
            $(".CountNum").html("1");
            $(".TotlePrice span").eq(1).html("$" + Number(result["price"]).toFixed(2));
            if (result["price"] != 0) {
                $(".Buy span").eq(0).html("$" + result["price"]).show();
            }
            Cookies.set("FinalProductId", pid);
            Parameters.ProductID = pid;
            Parameters.FinalProductId = pid;
            $(".specList").html('').hide();
            if (reget) {
                ConfirmOrder.init();
            }
        }
    },
    GetFinalProductId: function (arr) {
        var parents = Parameters.SkuProduct;
        for (var i = 0; i < parents.length; i++) {
            var mainobject = parents[i]; // a potential parent
            var temp = 0;
            for (var g = 0; g < arr.length; g++) {
                for (var skuChild in mainobject.SkuProps) {
                    if (mainobject.SkuProps.hasOwnProperty(skuChild)) {
                        if (mainobject.SkuProps[skuChild].PropCode == arr[g].name && mainobject.SkuProps[skuChild].PropValueId == arr[g].id) {
                            temp++;
                            if (temp == arr.length) {
                                return mainobject;
                            }
                        }
                    }
                }
            }
        }
    },

}
function generateUUID() { // Public Domain/MIT 
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function getSkuProductBySelectedProps(arr) {
    var ret = $.grep(Parameters.SkuProduct, function (sku) {
        var restarr = $.grep(arr, function (value) {
            return getProductPropValue(sku, value.PropCode) != value.PropValueId;
        });
        return restarr.length == 0 && sku.ProductStock > 0;
    });
    return ret;
}

function getProductPropValue(prod, propCode) {
    var ret = null;
    $(prod.SkuProps).each(function () {
        if (this.PropCode == propCode) {
            ret = this.PropValueId;
        }
    });
    return ret;
}

function comicButtonEvent() {
    if (!Parameters.clickCheck || $(this).hasClass("active"))
        return;
    Parameters.clickCheck = false;
    $(this).addClass("active").parent().siblings().find("img").removeClass("active");
    var id = $(this).attr("id");
    if (id)
        Parameters.BGID = id;
    if (Parameters.isRenderProduct) {
        CarouseFigureMask(Parameters.MaskResult);
    } else {
        GoRender(Parameters.BGID, function () {
            Parameters.clickCheck = true;
        });
    }
}
function CarouseFigureMask(result, update) {
    Parameters.clickCheck = false;
    var _this = this;
    POP.StartLoading();
    $(".ComicShow").addClass("NoBorder");
    if (Parameters.bgSaver[result["Product"]["BannerImages"][0].BkgdImg] && !update) {
        // console.log(Parameters.bgSaver[result["Product"]["BannerImages"][0].BkgdImg][Parameters.BGID])
        if (Parameters.bgSaver[result["Product"]["BannerImages"][0].BkgdImg][Parameters.BGID] != undefined) {
            var Path = Parameters.bgSaver[result["Product"]["BannerImages"][0].BkgdImg][Parameters.BGID];
            //Parameters.Thumb = Path;
            $("[name='renderResult']").attr("src", Path).hide().fadeIn(300);
            $(".CoverMask").hide();
            POP.CloseLoading();
            $(".Buy span").eq(0).html("$" + result["Product"]["SalePrice"]).show();
            Parameters.clickCheck = true;
            return;
        }

    }
    var AC = {};

    AC.EmbedImageUrl = "";
    AC.BackImageUrl = result["Product"]["BannerImages"][0].BkgdImg;
    AC.MaskImageUrl = result["Product"]["BannerImages"][0].ImagePath;
    var points = JSON.stringify(GetLocationPoints(result["Product"]["BannerImages"][0].LocationPoints));

    function GetLocationPoints(points) {
        var ARR = [];
        for (var i = 0; i < points.length; i++) {
            var ss = points[i].split(",");
            ARR.push(Number(ss[0]));
            ARR.push(Number(ss[1]));
        }
        return ARR;
    }
    AC.P4 = JSON.parse(points);
    AC.BackgroundName = Parameters.BGID + "02";
    AC.Heads = [];
    AC.Heads.push({ "Key": Parameters.FACEUID, "Value": 0 });
    Parameters.Heads = AC.Heads;
    AC.GrayStyle = 1;
    //AC.AddWaterMark = 1;
    AC.ImageFormatType = 0;
    jQuery.ajax({
        type: "post",
        async: true,
        url: MomentCam.urls.carouseFigureMaskUrl,
        timeout: 25000,
        cache: false,
        data: "json=" + JSON.stringify(AC),
        success: function (data) {
            //console.log(data);
            data = JSON.parse(data);
            data.Path = data.Path.replace("square-ali.manboker.com", "square.oss-cn-hangzhou.aliyuncs.com").replace("production-us.manboker.com", "moman-production-us.oss-us-west-1.aliyuncs.com");
            if (!Parameters.bgSaver[AC.BackImageUrl])
                Parameters.bgSaver[AC.BackImageUrl] = {};
            Parameters.link = data.Path;
            data.Path = data.Path + Parameters.RenderPrefix + "/resize,w_550";
            Parameters.bgSaver[AC.BackImageUrl][Parameters.BGID] = data.Path ;
            Parameters.Thumb = data.Path;
            loadImage(data.Path, function () {
                $("[name='renderResult']").attr("src", data.Path).hide().fadeIn(300);
                if (Parameters.isRenderProduct) {
                    $(".ComicShow").addClass("NoBorder");
                } else {
                    $(".ComicShow").removeClass("NoBorder");
                }
                $(".CoverMask").hide();
                POP.CloseLoading();
                Parameters.clickCheck = true;
            });
        },
        error: function (e) { }
    });
}
var ConfirmFlag = false, isSelectAll = false;
var BindEvent = {
    init: function () {
        $(".swiper-button-next").on("click", function () {
            $($(this).parent().find(".swiper-wrapper")).animate({
                scrollLeft: "+=650",
            }, 500, function () {

            });
        });
        $(".swiper-button-prev").on("click", function () {
            $($(this).parent().find(".swiper-wrapper")).animate({
                scrollLeft: "-=650",
            }, 500, function () { });
        });
        $(".resetGroup .a").on("click", function () {
            window.location.href = "beauty.html?v=" + Math.random();
        });
        $(".resetGroup .b").on("click", function () {
            window.location.href = "upload.html?v=" + Math.random();
        });
        $(".Buy").on("click", this.BuyClick);
        $(".order_Main,.chooseSpec").on("click", function () {
            return false;
        });
        $(".chooseSpecCover").not(".addAddress").on("click", function () {
            if (ConfirmFlag) {
                Confirm("malesss");
            } else {
                $(".chooseSpecCover").fadeOut();

                $(".chooseSpec").animate({ "right": "-552px" }, 300);
                $(".order_Main").animate({ "right": "-1034px" }, 300);
            }
        });
        $(".UseCodeBtn").on("click", function () {
            Confirm("u");
        });
        $(".Confirm").on("click", function () {
            $(".Code input").val("");
            $(".productName span").eq(1).html("");
            if (Parameters.isRenderProduct) {
                $(".EmailBox").hide();
                $(".EmailBox input").val("");
                $(".addressesBox").show();
            } else {
                $(".EmailBox").show();
                $(".EmailBox input").val("");
                $(".addressesBox").hide();
            }
            Cookies.set("isRenderProduct", Parameters.isRenderProduct);
            Cookies.set("Parameters", Parameters.virtualObj);
            if (isSelectAll) {
                Cookies.set("ProductCount", $(".CountNum").html());
                Cookies.set("ProductImg", $("[name='renderResult']").attr("src"));
                window.location.href = "order.html?v=" + Math.random();
            } else {
                if ($(".specList").css("display") == "none") {
                    Cookies.set("ProductCount", $(".CountNum").html());
                    Cookies.set("ProductImg", $("[name='renderResult']").attr("src"));
                    window.location.href = "order.html?v=" + Math.random();
                } else {
                    POP.Alert("Please select model!");
                }
            }
        });
        //提交订单
        $(".submitButton").on("click", function () {
            if (!Parameters.clickCheck)
                return;
            //if ($(".boxAddress").length == 0) {
            //    POP.Alert("Invalid address");
            //    return;
            //}
            ConfirmOrder.SubmitOrder(Parameters.isRenderProduct);

        });
        //减少商品
        $(".reduce").on("click", function () {
            if (Number($(".CountNum").html()) == 1) {
                return;
            }
            Parameters.BuyCount = Number($(".CountNum").html());
            var minNum = 1;
            if (Parameters.ProductStock == 0) {
                minNum = 0;
            }
            if (Parameters.BuyCount <= minNum) {
                Parameters.BuyCount = minNum;
            } else {
                Parameters.BuyCount--;
            }
            if (Parameters.BuyCount > 1) {
                $(".reduce").css({
                    "background": "#f5f5f5", "cursor": "pointer"
                });
            } else {
                $(".reduce").css({
                    "background": "#fbfbfb", "cursor": "not-allowed"
                });
            }
            $(".CountNum").html(Parameters.BuyCount);
            var price = 0;
            if (!ProductObj)
                price = 9.99;
            else
                price = ProductObj["Product"]["SalePrice"];
            $(".TotlePrice span").eq(1).html("$" + (Number(price) * Number($(".CountNum").html())).toFixed(2));
        });
        //增加商品
        $(".add").on("click", function () {
            Parameters.BuyCount = Number($(".CountNum").html());
            var limitCount = 0;
            var showinfo = "";
            if (ProductObj) {
                if (Parameters.ProductStock > Parameters.LimitBuyCountPerOrder) {
                    limitCount = Parameters.LimitBuyCountPerOrder;
                    showinfo = "每件商品限购" + limitCount + "件";
                } else {
                    limitCount = Parameters.ProductStock;
                    showinfo = "资源紧张，库存不足！";
                }
            } else {
                $(".add").css({
                    "background": "#fbfbfb", "cursor": "not-allowed"
                });
                limitCount = 1;
            }
            if (Parameters.BuyCount >= limitCount) {
                Parameters.BuyCount = limitCount;
            } else {
                Parameters.BuyCount++;
            }
            if (Parameters.BuyCount > 1 && ProductObj) {
                $(".reduce").css({
                    "background": "#f5f5f5", "cursor": "pointer"
                });
                $(".add").css({
                    "background": "#fbfbfb", "cursor": "pointer"
                });
            } else {
                $(".reduce").css({
                    "background": "#fbfbfb", "cursor": "not-allowed"
                });
            }
            $(".CountNum").html(Parameters.BuyCount);
            var price = 0;
            if (!ProductObj)
                price = 9.99;
            else
                price = ProductObj["Product"]["SalePrice"];

            $(".TotlePrice span").eq(1).html("$" + ((Number(price)) * Number($(".CountNum").html())).toFixed(2));
        });
    },
    BuyClick: function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!Parameters.clickCheck)
            return;
        $.when(POP.CheckLogin())
        .done(function () {
            BindEvent.Buy();
        })
        .fail(function () {
            //Alert("You have to login first");
            POP.ShowLogin(function () {
                BindEvent.Buy();
            })
            //Confirm("login");
        });
    },
    Buy: function () {
        try {
            if (fbq) {
                fbq('track', 'BuyNow', {
                    resourceID: [Parameters.BGID], productID: [Cookies.get("FinalProductId")]
                });
            }
        } catch (e) { }
        //$(".chooseSpecCover").fadeIn();
        //$(".chooseSpec").animate({ "right": "0" }, 300);
        ConfirmFlag = false;
        var data = 'token=' + Cookies.get('TOKEN') + '&json={BackgroundName:\"' + Parameters.BGID + "02" + '",Heads:' + JSON.stringify(Parameters.Heads) + ',GrayStyle:1}';
        CallAjax(MomentCam.urls.syncOrderDataUrl, data, function (result) {
            if (result.StatusCode == 4363441) {
                Parameters.DataUID = result.DataUID;
                Cookies.set("isRenderProduct", Parameters.isRenderProduct);
                Cookies.set("Parameters", Parameters.virtualObj);
                Cookies.set("ProductImg", $("[name='renderResult']").attr("src"));
                Cookies.set("FinalProductId", Parameters.FinalProductId);
                Cookies.set("CartoonCode", Parameters.BGID);
                Cookies.set("DataUid", Parameters.DataUID);
                location.href = "order.html?v="+Math.random();
           } else {
                POP.Alert("Network unaliable, please try again");
            }
        });
    }
}
function GoRender(bg, callback) {
    var _ = this;
    $(".specList").html('').hide();
    $(".Btns").find(".Buy").hide().end().find(".Share").css("float", "none").css("background-repeat", "no-repeat").css("margin", "0 auto");
    if (bg && Parameters.RenderSaver[bg]) {
        Parameters.clickCheck = true;
        //console.log(Parameters.RenderSaver[bg].Path);
        Parameters.link = Parameters.RenderSaver[bg].Path;
        $("[name='renderResult']").attr("src", (Parameters.RenderSaver[bg].Path).replace("http:", "https:"));
        $(".CoverMask").hide();
        POP.CloseLoading();
        if (callback)
            return callback("");
        return;
    } else {
        Parameters.RenderSaver[bg] = {
        };
    }
    POP.StartLoading();
    var json = {
    };
    if (!bg) {
        json.BackgroundName = Parameters.Gender == 1 ? Parameters.maleBG : Parameters.femaleBG;
    } else {
        Parameters.BGID = bg;
        json.BackgroundName = bg + "02";
    }
    json.Heads = [];
    json.Heads.push({
        "Key": Parameters.FACEUID,
        "Value": 0
    });
    Parameters.Heads = json.Heads;
    json.GrayStyle = 1;
    json.AddWaterMark = "1";
    json.WaterMarkUrl = "https://mall-res.momentcam.net/Images/watermark.png";
    json.ImageFormatType = MomentCam.config.isSupportWebp ? 2 : 2;
    CallAjax(MomentCam.urls.serverRender, "json=" + JSON.stringify(json), function (result) {
        result.Path = result.Path.replace("square-ali.manboker.com", "square.oss-cn-hangzhou.aliyuncs.com").replace("production-us.manboker.com", "moman-production-us.oss-us-west-1.aliyuncs.com");
        result.Path = result.Path + Parameters.RenderPrefix + "/resize,w_550";
        loadImage(result.Path, function () {
            Parameters.clickCheck = true;
            Parameters.RenderSaver[bg].Path = result.Path;
            Parameters.link = result.Path;
            $(".ComicShow").removeClass("NoBorder");
            $("[name='renderResult']").attr("src", (result.Path).replace("http:", "https:")).hide().fadeIn(300);
            $(".CoverMask").hide();
            POP.CloseLoading();
            if (callback)
                return callback("");
        });
    });
}
(function (w) {
    var CameraBox = {
        init: function () {
            $(".partOneRight .PicShow .showBox").hide();
            $(".cameraBox").show();
            var video = document.getElementById('v');
            $(".CameraTips").show();
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.play();
                });
            } else if (navigator.getUserMedia) { // Standard
                navigator.getUserMedia({ video: true }, function (stream) {
                    video.src = stream;
                    video.play();
                }, errBack);
            } else if (navigator.webkitGetUserMedia) { // WebKit-prefixed
                navigator.webkitGetUserMedia({ video: true }, function (stream) {
                    video.src = window.webkitURL.createObjectURL(stream);
                    video.play();
                }, errBack);
            } else if (navigator.mozGetUserMedia) { // Mozilla-prefixed
                navigator.mozGetUserMedia({ video: true }, function (stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.play();
                }, errBack);
            }
            getVideo();
            function getVideo(){
                $(".CameraTips").hide();
                $(".cameraCover").show();
                $(".cameraBox").animate({ "top": "0" }, 300);
                // Trigger photo take
                document.getElementById("snap").addEventListener("click", function () {
                    video.style.visibility = "hidden";
                    $("#canvasCemara").css("visibility", "visible");
                    canvas = document.getElementById('canvasCemara');
                    ctx = canvas.getContext('2d');
                    var _w = 520, _h = 520;
                    if (video.videoWidth > 0) _h = video.videoHeight / (video.videoWidth / _w);
                    canvas.setAttribute('width', _w);
                    canvas.setAttribute('height', _h);
                    ctx.fillRect(0, 0, _w, _h);
                    ctx.drawImage(video, 0, 0, _w, _h);
                    $(".resetButton").show();
                    $(".shootButton").hide();
                    $("#reset").off("click").on("click", function () {
                        $(".resetButton").hide();
                        $(".shootButton").show();
                        video.style.visibility = "visible";
                        $("#canvasCemara").css("visibility", "hidden");
                    });
                    $("#confirm").off("click").on("click", function () {
                        $(".cameraCover").hide();
                        $(".cameraBox").css("top", "-600px");
                        U.handleImageCatch("shoot");
                    });
                });
            }
        },
    }
    var U = {
        init: function () {
            if ((navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
                $(".cameraShoot").on("click", CameraBox.init);
            } else {
                $(".cameraShoot img").attr("../img/Upload/icon_camera_grey.png");
                $(".cameraShoot").css("cursor", "not-allowed");
            }
            this.EventBind();
        },
        EventBind: function () {
            var _ = this;
            var uploadPlugin = $(".showBox");
            var fileInput = $("#file");
            uploadPlugin.on("click", function () {
                fileInput.trigger("click");
            }).on("dragover", function (e) {
                e.preventDefault();
                e.stopPropagation();
            }).on("drop", function (e) {
                e.preventDefault();
                e.stopPropagation();
                fileInput.trigger("change", e.originalEvent.dataTransfer.files);
            });
            $(".uloadPhoto").on("click", function () {
                $(".CameraTips,.cameraBox").hide();
                $(".showBox").show();
                fileInput.trigger("click");
            });
            fileInput.on("change", function (e, drop) {
                if (document.getElementById("file").files.length == 0) {
                    return;
                }
                POP.ShowLoading();
                var f = document.getElementById("file").files[0] || drop;
                U.handleImageCatch("upload", f);
            });
            //关闭摄像头弹出层
            $(".cameraClose").on("click", function () {
                $(".cameraCover").hide();
                $(".cameraBox").css("top", "-600px");
            });
        },
        handleImageCatch: function (type, f) {
            var _this = this;
            GetUploadImage(f, type, function (result) {
                try {
                    document.getElementById("file").value = "";
                } catch (e) { }
                POP.CloseLoading();
                if (result.StatusCode == "0") {
                    var imgUrl = result.Files[0].FileUrl.replace("square-ali.manboker.com", "square.oss-cn-hangzhou.aliyuncs.com").replace("production-us.manboker.com", "moman-production-us.manboker.com");
                    //console.log(imgUrl);
                    CallAjax(MomentCam.urls.getFaceUidUrl, "url=" + imgUrl + "&useruid=0&platform=h5&language=zh", function (result) {
                        //POP.CloseLoading();
                        if (result.StatusCode == -4363402) {
                            POP.Alert("It seems there was an issue with the picture you used. Please try using a different picture!");
                            //POP.displayControl(0);
                        } else if (result.FaceUID == "") {
                            POP.Alert("Upload picture failed, Please upload again!");
                            POP.displayControl(0);
                        } else {
                            POP.displayControl(1);
                            localStorage.setItem('faceuid', result.FaceUID);
                            localStorage.setItem('offsetY', result.FaceOffsetY);
                            window.location.href = "beauty.html?v=" + Math.random();
                        }
                    })
                } else {
                    //console.log("上传失败");
                }
            })
        },
    }
    window.U = U;
})(window)