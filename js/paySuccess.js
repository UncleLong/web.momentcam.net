$(function () {
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
    var data = Cookies.get('orderData');
    if (data)
        data = JSON.parse(data);
    function email() {
        var url = "https://or.momentcam.net/network/sendorderemail.ashx";
        SendData(url, "extend=" + JSON.stringify(data), function (result) {
            console.info("result：", result);
        });
    }

    function SendData(url, data, callBack) {
        $.ajax({
            type: "post",
            async: true,
            headers: {
                'EncryptType': 'NONE'
            },
            dataType: "json",
            url: url,
            timeout: 25000,
            cache: false,
            data: data,
            success: function (result) {
                try {
                    return callBack(result);
                } catch (e) {
                    return callBack(e.message);
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    }
    var flag = true;
    if (fbq)
        fbq('trackCustom', 'Purchase', { resourceID: ['' + Cookies.get("CartoonCode") + ''], productID: ['' + Cookies.get("FinalProductId") + ''], value: '' + Cookies.get("result").PayableAmount + '', currency: 'USD' });
    if (Cookies.get("FinalProductId") != 424 && Cookies.get("FinalProductId") != 444) {
        email();
        $(".OK a").html("Vissza a MomentCam-re");
    } else {
        flag = false;
        $("#tip").show();
        $(".OK a").html("Áttekintés").css("font-size","24px");
    }
    $("#orderid").html(JSON.parse(Cookies.get("result")).OrderIds);
    $(".OK").on("click", function () {
        if (flag) {
            window.parent.parent.location.reload();
        } else {
            window.parent.$(".GoLoadPic").show().trigger("click");
        }
    });
    $("body").unbind("click").on("click", function () {
        window.parent.hiding($(this));
    });
});