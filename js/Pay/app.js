var App = {
    Urls: {
        CreateBraintreeUrl: "https://pay.manboker.com/api/Pay/CreateBrainTreeData",
        BraintreePayBackUrl: "https://pay.manboker.com/api/PayBack/BraintreePayBack",
        },
    IsApp: function () {
        try {
            var isapp = false;
            mcAPI.isIOS = !!navigator.userAgent.match(/iPhone|iPad|iPod|iOS/i);
            mcAPI.getClientInfo(function (result) {
                isapp = true;
            });
        } catch (e) {
        }
        return isapp;
    },
    GetUrlParam: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    },
    GetLangName: function () {
        return App.GetUrlParam("lang") || App.Storage.get("lang") || "zh";
    },
    GetLang: function (obj) {
        return obj[App.GetLangName()] || obj["en"];
    },
    //cookie storage
    Cookie: {
        /**
         * 获取cookie指定name值
         */
        get: function (name) {
            var cookie = document.cookie,
                e, p = name + "=",
                b;
            if (!cookie)
                return;
            b = cookie.indexOf("; " + p);
            if (b == -1) {
                b = cookie.indexOf(p);
                if (b != 0)
                    return null;
            } else {
                b += 2;
            }
            e = cookie.indexOf(";", b);
            if (e == -1)
                e = cookie.length;
            return decodeURIComponent(cookie.substring(b + p.length, e));
        },
        /**
         * 设置cookie
         *
         *  expires参数可以是js Data()对象或过期的秒数     *
         */
        set: function (name, value, expires, path, domain, secure) {
            var d = new Date();
            if (typeof (expires) == 'object' && expires.toUTCString) {
                expires = expires.toUTCString();
            } else if (parseInt(expires, 10)) {
                d.setTime(d.getTime() + (parseInt(expires, 10) * 1000));
                expires = d.toUTCString();
            } else {
                expires = '';
            }
            document.cookie = name + "=" + encodeURIComponent(value) +
                ((expires) ? "; expires=" + expires : "") +
                ((path) ? "; path=" + path : ";path=/") +
                ((domain) ? "; domain=" + domain : "") +
                ((secure) ? "; secure" : "");
        },
        /**
         * 删除cookie
         */
        remove: function (name, path) {
            this.set(name, '', -1000, path);
        }
    },
    Storage: {
        get: function (key) {
            return window['sessionStorage'].getItem(key);
        },
        set: function (key, value) {
            window['sessionStorage'].setItem(key, value);
        },
        remove: function (key) {
            window['sessionStorage'].removeItem(key);
        }
    }
};

(function ($) {
    var dialogs = [];
    var h5Dialog = function (isPc) {
        dialogs.push(this);
        var tmpl = '<div style="background-color:black;opacity:.6;padding:40px 60px;border-radius:5px;position:absolute;z-index:9999;transform:translate(-50%,-50%);-webkit-transform:translate(-50%,-50%);text-align:center; left:50%;top:50%;width:80%;">' +
            '<span style="color:white;font-size:48px;">{text}</span></div>';
        if (isPc) {
            tmpl = '<div style="background-color:black;opacity:.6;padding:10px 10px;border-radius:5px;position:absolute;z-index:9999;transform:translate(-50%,-50%);-webkit-transform:translate(-50%,-50%);text-align:center; left:50%;top:50%;width:50%;">' +
                '<span style="color:white;font-size:18px;">{text}</span></div>';
        }
        var thisHtml = null;
        var thisDialog = this;
        this.show = function (content, second) {
            thisHtml = $(tmpl.replace('{text}', content));
            $(document.body).append(thisHtml);
            if (second) {
                setTimeout(function () { thisDialog.destroy(); }, 1000 * second);
            }
        };
        this.destroy = function () {
            if (thisHtml) {
                thisHtml.remove();
            }
        };

    };
    var dialogExtend = {
        tips: function (content, second, isPc) {
            //不支持多次弹框
            var delDialog;
            while (dialog = dialogs.shift()) {
                dialog.destroy();
            }
            second = second || 1.5;
            var dialog = new h5Dialog(isPc);
            dialog.show(content, second);
        },
        pcTips :function(content, second) {
            tips(content, second, true);
        }
    };
    $.extend({
        dialog: dialogExtend
    });

})(jQuery);
