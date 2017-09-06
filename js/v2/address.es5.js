"use strict";

var DeliveryArea = [4658, 4661, 8, 4668, 4673, 4674, 4681, 4683, 4687, 28, 4691, 4702, 4706, 4708, 4713, 4717, 4720, 4723, 4724, 4729, 4732, 4744, 4745, 4746, 70, 71, 4749, 4752, 50, 4762, 4767, 4768, 4769, 4770, 4771, 39, 4776, 4782, 4783, 4784, 4793, 4795, 4803, 4812, 4813, 4814, 4819, 20, 4826, 4830, 65, 4834, 4835, 25, 4840, 4846, 4847, 4849, 56, 4865, 4867, 40, 73];
var object = {};
var stop = true;

$(function () {
    $(".boxCreat").unbind("click").on("click", function () {
        $(".addAddress").slideDown(300);
        GetContryList();
    });
    $(".addAddress_cancel").unbind("click").on("click", function () {
        $(".addAddress").slideUp(300);
    });
    $(".addAddress_save").on("click", function () {
        if (stop) {
            if (Address.CheckForm()) {
                insertAddress();
                stop = false;
            }
        }
    });
});
function Alert(str) {
    $(".cover").find("p").html(str);
    $(".cover").fadeIn(function () {
        $(document).one("click", ".FaileSure,.coverClose", function () {
            $(".cover").fadeOut();
        });
    });
}
var Address = {
    GetAddressList: function GetAddressList() {
        jQuery.ajax({
            type: "post",
            async: true,
            url: MomentCam.urls.getAllAdressUrl,
            data: "Language=en&token=" + Cookies.get('TOKEN'),
            cache: false,
            beforeSend: function beforeSend(request) {
                request.setRequestHeader("EncryptType", "NONE");
            },
            success: function success(result) {
                //console.log(result);
                if (result.StatusCode == 0) {
                    if (result.AddrList.length == 0) {
                        $(".addAddress").show();
                        GetContryList();
                        return;
                    }
                    for (var i = 0; i < result.AddrList.length; i++) {
                        var addList = result.AddrList[i];
                        var address = {
                            AddrId: addList.AddrId,
                            CountryId: addList.CountryId,
                            //ProvinceId: addList.ProvinceId,
                            Mobile: addList.Mobile,
                            Email: addList.Email,
                            ShipName: addList.ShipName,
                            AddrDetail: addList.AddrDetail,
                            AddrDetail1: addList.AddrDetail1,
                            StateName: addList.StateName,
                            CityName: addList.IntlCityName,
                            IsDefault: 1,
                            AddrType: addList.CountryId,
                            RegionCode: addList.RegionCode,
                            PostCode: addList.PostCode,
                            countryName: addList.CountryName
                        };
                        renderAddressDIV(address);
                    }
                    $(".addressBox").append("<div class='showAll'>more address<div class='tu'></div></div>");
                    $(".boxAddress").unbind("click").on("click", function () {
                        $(this).addClass("active").siblings().removeClass("active");
                        Cookies.set("email", $(this).find(".address").attr("email"));
                        Cookies.set('address', $(this).find(".address").html());
                        Cookies.set('mobile', $(this).find(".mobileNumber").html());
                        Cookies.set('zipCode', $(this).find(".address").attr("zipCode"));
                        Cookies.set('receiver', $(this).find(".name").html());
                        saveConsignee();
                    });
                    if ($(".boxAddress").length > 2) {
                        $(".boxAddress").eq(1).nextAll(".boxAddress").hide();
                        $(".showAll").show();
                    } else {
                        $(".showAll").hide();
                    }
                    $(".showAll").on("click", function () {
                        if ($(".boxAddress").length > 2) {
                            if ($(this).hasClass("a")) {
                                $(".boxAddress").eq(1).nextAll(".boxAddress").hide();
                                $(this).removeClass("a");
                                $(".showAll").html("more address<div class='tu'></div>");
                                $(".tu").css("background-image", "url('https://mall-res.momentcam.net/Images/mo/Order/order_address_number_down.png')");
                            } else {
                                $(".boxAddress").eq(1).nextAll(".boxAddress").show();
                                $(this).addClass("a");
                                $(".showAll").html("pack up<div class='tu'></div>");
                                $(".tu").css("background-image", "url('https://mall-res.momentcam.net/Images/mo/Order/order_address_number_up.png')");
                            }
                        }
                    });
                }
            },
            error: function error(e) {
                throw e.message;
            }
        });
    },
    CheckForm: function CheckForm() {
        var check = true;
        $('.addAddress input[required]').each(function () {
            if (this.value.trim() == '') {
                Alert("Please add delivery address.");
                check = false;
                return check;
            }
        });
        return check;
    }
};
function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}
function insertAddress() {
    var address = {
        token: Cookies.get("TOKEN"),
        CountryId: object.countryID,
        //ProvinceId: "1",
        Mobile: $("#mobile").val(),
        Email: $("#email").val(),
        ShipName: $("#receiver").val(),
        AddrDetail: $("#address1").val(),
        AddrDetail1: $("#address2").val(),
        StateName: $("#stateOrProvince").val(),
        CityName: $("#city").val(),
        IsDefault: 1,
        AddrType: object.countryID == 1 ? "1" : "2",
        RegionCode: $(".numCode").val(),
        PostCode: $("#zipCode").val(),
        countryName: $("#country").val()
    };
    $.ajax({
        type: "POST",
        url: MomentCam.urls.insertAddressUrl,
        data: address,
        dataType: "json",
        success: function success(data) {
            console.info("insertAddress data:", data);
            if (null != data) {
                if (0 == data.StatusCode) {
                    //保存 AddrId， 追加 addressDiv
                    address.AddrId = data.AddrId;
                    renderAddressDIV(address, true);
                    if ($(".boxAddress").length > 2) {
                        $(".boxAddress").eq(1).nextAll(".boxAddress").hide();
                    }
                    Cookies.set('address', $("#address1").val() + $("#city").val() + $("#stateOrProvince").val());
                    Cookies.set('mobile', $("#mobile").val());
                    Cookies.set('zipCode', $("#zipCode").val());
                    Cookies.set('receiver', $("#receiver").val());
                    Cookies.set("email", $("#email").val());
                    $(".addAddress").slideUp(300).find("input").val("");
                    saveConsignee();
                    $(".boxAddress").unbind("click").on("click", function () {
                        if ($(this).hasClass("active")) return;
                        $(this).addClass("active").siblings().removeClass("active");
                        Cookies.set("email", $(this).find(".address").attr("email"));
                        Cookies.set('address', $(this).find(".address").html());
                        Cookies.set('mobile', $(this).find(".mobileNumber").html());
                        Cookies.set('zipCode', $(this).find(".address").attr("zipCode"));
                        Cookies.set('receiver', $(this).find(".name").html());
                        saveConsignee();
                    });
                } else {
                    // 输出错误信息
                    alert(data.Description);
                }
            }
        },
        // 当通过ajax异步调用出错时，会调用 error函数 。error函数语法为：
        //(默 认: 自动判断 (xml 或 html)) 请求失败时调用时间。
        //参数有以下三个：XMLHttpRequest 对象、错误信息、（可选）捕获的错误对象。
        //如果发生了错误，错误信息（第二个参数）除了得到null之外，
        //还可能是"timeout", "error", "notmodified" 和 "parsererror"。
        //textStatus: "timeout", "error", "notmodified" 和 "parsererror"。
        error: function error(XMLHttpRequest, textStatus, errorThrown) {
            console.error("insertAddress textStatus:", textStatus);
            alert('系统错误，请稍后重试');
        }
    }).always(function () {
        stop = true;
    });
}
function renderAddressDIV(address, isInsert) {
    var addressDiv = '<div class="box boxAddress active" id="' + address.AddrId + '">' + '<div class="box-left">' + '<span class="name" email="' + address.Email + '">' + address.ShipName + '</span>' + '<span class="mobileNumber">' + address.RegionCode + " " + address.Mobile + '</span>' + '<span class="address" zipCode="' + address.PostCode + '">' + address.AddrDetail + "," + address.AddrDetail1 + "," + address.CityName + "," + address.StateName + '</span>' + '<span class="PostCode">' + address.PostCode + '</span>' + '</div>' + '<p class="country">' + address.countryName + '</p>' + '<div class="default"></p>' + '</div>';

    $(".boxAddress").each(function () {
        $(this).removeClass("active");
    });
    //if (isInsert) {
    // $(".boxCreat").prepend(addressDiv);
    // } else {
    $(".boxCreat").after(addressDiv);
    // }
}
/**
 * 地址div
 * @param address
 * @param className
 */
function addressDiv(address) {}
/**
 * 地址div
 * @param address
 * @param className
 */
function GetContryList() {
    jQuery.ajax({
        type: "post",
        async: true,
        url: MomentCam.urls.GetAllRegionCode,
        data: "Language=en",
        cache: false,
        beforeSend: function beforeSend(request) {
            request.setRequestHeader("EncryptType", "NONE");
        },
        success: function success(result) {
            //console.log(result);
            var html = "";
            var num = "";
            for (var i = 0; i < DeliveryArea.length; i++) {
                var name = "";
                var code = "";
                for (var k = 0; k < result["Regions"].length; k++) {
                    if (DeliveryArea[i] == result["Regions"][k].Id) {
                        name = result["Regions"][k].Name;
                        code = result["Regions"][k].RegionCode;
                    }
                }
                html += '<option class="sort_list" countryId="' + DeliveryArea[i] + '" name="' + name + '" code="' + code + '">' + name + '</option>';
                num += '<option class="code_list" countryId="' + DeliveryArea[i] + '" name="' + name + '" code="' + code + '">' + code + '</option>';
            }
            $("#country").html(html);
            $(".numCode").html(num);
            $(".sort_list[countryId='40']").attr("selected", "selected");
            $(".code_list[code='+1']").attr("selected", "selected");
            Cookies.set('country', $("#country").val());
            Cookies.set('countryID', $(".numCode").val());
            object.countryID = $(".sort_list:checked").attr("countryId");

            $("#country").change(function () {
                object.countryID = $(".sort_list:checked").attr("countryId");
                object.code = $(".sort_list:checked").attr("code");
                object.countryName = $(".sort_list:checked").attr("name");
                Cookies.set('country', object.countryName);
                Cookies.set('countryID', $(".numCode").val());
                $(".numCode").val(object.code);
                //console.log(object.countryID);
            });
            $(".numCode").change(function () {
                object.countryID = $(".code_list:checked").attr("countryId");
                object.code = $(".code_list:checked").attr("code");
                object.countryName = $(".code_list:checked").attr("name");
                $("#country").val(object.countryName);
                Cookies.set('country', object.countryName);
                Cookies.set('countryID', $(".numCode").val());
            });
        },
        error: function error(e) {
            throw e.message;
        }
    });
}

/**
 * 交易时保存收货地址
 */
function saveConsignee() {
    var addrId = $('.boxAddress.active').attr("id");
    console.info("addrId", addrId);
    var info = {
        Token: Cookies.get("TOKEN"),
        ProductId: Cookies.get("FinalProductId"),
        ProductCount: parseInt($(".CountNum").html()),
        AddrId: addrId,
        DeviceId: '12332ds456'
    };
    $.ajax({
        type: "POST",
        url: MomentCam.urls.saveConsignee,
        data: info,
        dataType: "json",
        success: function success(data) {
            console.info(data);
            if (data.StatusCode == 0) {
                $(".shippingFee .price").html("$" + data.Orders[0].ShippingFee);
                $(".totalPrice span").eq(1).html("$" + data.PayableAmount.toFixed(2));
            } else {
                alert(data.Description);
            }
        },
        // 当通过ajax异步调用出错时，会调用 error函数 。error函数语法为：
        //(默 认: 自动判断 (xml 或 html)) 请求失败时调用时间。
        //参数有以下三个：XMLHttpRequest 对象、错误信息、（可选）捕获的错误对象。
        //如果发生了错误，错误信息（第二个参数）除了得到null之外，
        //还可能是"timeout", "error", "notmodified" 和 "parsererror"。
        //textStatus: "timeout", "error", "notmodified" 和 "parsererror"。
        error: function error(XMLHttpRequest, textStatus, errorThrown) {
            console.error("updateAddress textStatus:", textStatus);
        }

    }).always(function () {});
}

