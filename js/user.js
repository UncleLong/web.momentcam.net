var U = (function () {
    'use strict';
    var IsLogin = null;
    var Users = {
        bind: function () {
            var _this = this;
            //根据点击的是登录还是注册显示
            $(".LoginNav>div").on("click", function () {
                if ($(this).hasClass("active")) return;
                $("#err").html("");
                $(this).addClass("active").siblings().removeClass("active");
                var _this = $(this);
                IsShow(_this);
            });
            $(document).on("click", "body", function () {
                hiding();
            });
            $(".LoginBox").on("click", function (e) {
                e.stopPropagation();
            });
            var showIndex = 2;
            $(".NoLogin span").on("click", function (e) {
                e.stopPropagation();
                $("#err").html("");
                var index = $(this).index();
                var flag = $(".LoginBox").hasClass("Drawer") ? true : false;
                if (index == 0) {
                    IsLogin = true;
                    $(".PwdSure").hide();
                    $(".IsRegister").show();
                    $(".Submit").html("Bejelentkezés");
                } else {
                    IsLogin = false;
                    $(".PwdSure").show();
                    $(".IsRegister").hide();
                    $(".Submit").html("Regisztráció");
                }
                $(".LoginNav>div").eq(index).addClass("active").siblings().removeClass("active");
                if (!flag) {
                    showIndex = index;
                    $(".LoginBox").addClass("Drawer");
                    U.LoginCallback();
                }

                return false;
            });
            $(".Submit").unbind("click").on("click", function () {
                if (IsLogin) {
                    _this.Login();
                } else {
                    _this.Reg();
                }
            });
            //判断是否显示图片下载按钮
            var p = "userid=" + Cookies.get("UserId");
            CallAjax(MomentCam.urls.getusercartoonsorder, p, function (result) {
                if (result.JsonLst.length != 0) {
                    document.getElementById('GoLoadPic').style.display = "block";
                }
            });
            $(".HasLogin").on("click", function () {
                $(".UserInfo").addClass("Drawer");
                $(".navBox").removeClass("opened");
                return false;
            });
            $(".GoLoadPic").on("click", function () {
                window.history.pushState("u", "Title", "Index.html?name=getHD");
                $("#iframeM").attr("src","Pages/LoadPic.html").fadeIn(300);
            });
            function IsShow(a) {
                if (a.hasClass("Login")) {
                    $(".PwdSure").hide();
                    $(".IsRegister").show();
                    $(".Submit").html("Bejelentkezés");
                    IsLogin = true;
                    showIndex = 0;
                } else {
                    $(".PwdSure").show();
                    $(".IsRegister").hide();
                    $(".Submit").html("Regisztráció");
                    IsLogin = false;
                    showIndex = 1;
                }

            }

        },

        LoginCallback: function (callback) {
            var _this = this;
            $(".Submit").unbind("click").on("click", function () {
                if (IsLogin) {
                    _this.Login(callback);
                } else {
                    _this.Reg(callback);
                }
            });
            $(".CreatBtn").unbind("c").on("click", function () {
                _this.GuestLogin(callback);
            });
        },
        Login: function (callback) {
            var _this = this;
            var username = $("#username").val();
            var password = $("#pwd").val();
            if (!username || !password) {
                this.ErrMsg("A felhasználóneved és a jelszavad nem maradhat üresen!");
                return;
            }
            var p = "UserName=" + username + "&Password=" + password + "&LoginFrom=Email&Language=zh";
            CallAjax(MomentCam.urls.loginUrl, p, function (r) {
                switch (r.StatusCode) {
                    case 0: {
                        _this.ErrMsg("");
                        _this.GetProfile(r, callback);
                        if(!callback)
                            $(".UserInfo").addClass("Drawer");
                        break;
                    }
                    case 113002: {
                        _this.ErrMsg("Hibás felhasználónév vagy jelszó!");
                        break;
                    }
                    case 113003: {
                        _this.ErrMsg("Ez a felhasználónév ismeretlen!");
                        break;
                    }
                }
            });
        },
        GuestLogin: function (callback) {
            var _this = this;
            CallAjax(MomentCam.urls.RegAndLogin, "RegType=Guest&UserName=&Password=&CountryCode=US&FromType=Guest", function (result) {
                console.log(result);
                if (result.StatusCode == "0") {
                    _this.GetProfile(result, callback);
                    $(".UserInfo").addClass("Drawer");
                }
            });
        },
        Reg: function (username, password) {
            var _this = this;
            var username = $("#username").val();
            var password = $("#pwd").val();
            var rpwd = $("#rpwd").val();
            if (!username || !password || !rpwd) {
                this.ErrMsg("Hibás felhasználónév vagy jelszó!");
                return;
            }
            if (password != rpwd) {
                this.ErrMsg("A megadott jelszavak nem egyeznek!");
                return;
            }
            if (password.length < 6) {
                this.ErrMsg("Six digits password at least");
                return;
            }
            function validateEmail(email) {
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email);
            }
            if (!validateEmail(username)) {
                this.ErrMsg("Invalid Email format!");
                return;
            }
            CallAjax(MomentCam.urls.RegAndLogin, "RegType=email&UserName=" + username + "&Password=" + password + "&CountryCode=US&FromType=html", function (result) {
                console.log(result);
                if (result.StatusCode == "0") {
                    _this.ErrMsg("");
                    _this.GetProfile(result);
                    $(".UserInfo").addClass("Drawer");
                } else if (result.StatusCode == 113011) {
                    _this.ErrMsg("Username already exist!");
                }
            });
        },
        CheckUser: function () {
            var _this = this;
            var user = Cookies.get("user");
            if (user) {
                user = JSON.parse(user);
                var token = user.Token;
                CallAjax(MomentCam.urls.checkUser, "TOKEN=" + token, function (r) {
                    if (r.StatusCode == 0) {
                        _this.GetProfile(user);
                    } else {
                        $(".NoLogin").show();
                    }
                });
            } else {
                $(".NoLogin").show();
            }
        },
        GetProfile: function (r, callback) {
            Cookies.set("user", r);
            Cookies.set("TOKEN", r.Token);
            Cookies.set("UserId", r.UserId);
            $(".NoLogin").hide();
            $(".HasLogin").show().find("img").attr("src", r.UserIcon).end().find("span").html(r.NickName);
            $(".headIcon").find("img").attr("src", r.UserIconBig).end().find("p").html(r.NickName);
            $(".LoginBox").removeClass("Drawer");
            jQuery.ajax({
                type: "post",
                async: true,
                data: '{TOKEN:\"' + r.Token + '\",UserID:\"' + r.UserId + '\"}',
                url: "../User.asmx/GetUserProfile",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                cache: false,
                success: function (data) {
                    var c = JSON.parse(data.d);
                    $(".UserContent .Following p").eq(0).html(c.Following);
                    $(".UserContent .Follower p").eq(0).html(c.Follower);
                    $(".UserContent .MmB p").eq(0).html(c.MmbBeans);
                    $(".UserContent .Credits p").eq(0).html(c.Credit);
                    var p = "userid=" + Cookies.get("UserId");
                    CallAjax(MomentCam.urls.getusercartoonsorder, p, function (result) {
                        if (result.JsonLst.length == 0) {
                            document.getElementById('GoLoadPic').style.display = "none";
                        }
                    });
                    if (callback)
                        return callback(r);
                }, error: function () {

                }
            });
        },
        ErrMsg: function (str) {
            $("#err").html(str);
        }
    }
    function CallAjax(url, data, callBack) {//请求数据
        jQuery.ajax({
            type: "post",
            async: true,
            url: url,
            data: data,
            cache: false,
            success: function (result) {
                try {
                    return callBack(JSON.parse(result));
                } catch (e) {
                    return callBack(result);
                }
            },
            error: function (e) {
                throw e.message;
            }
        });
    }
    $(function () {
        Users.bind();
        Users.CheckUser();
    });
    return Users;
})();

function showing(callback) {
    $(".NoLogin span").eq(0).trigger("click");
    U.LoginCallback(callback);
}