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
            window.parent.location.href = window.parent.location.href.split("?")[0];
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
