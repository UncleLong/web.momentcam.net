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