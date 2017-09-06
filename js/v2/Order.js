(function(){var Order = {
    submitObj:{},
    Common: function () {
        $(".Quantity").html(Cookies.get("ProductCount"));
        if (Cookies.get("isRenderProduct") == "false") {
            var notProductInfo=JSON.parse(Cookies.get("Parameters"));
            $(".addressBox").hide();
            $(".PayTitle .Num").html("1");
            $(".UnitPrice").html(notProductInfo.price+" Ft");
            $(".ItemTotal").html(notProductInfo.price+" Ft");
            $(".Subtotal").html(notProductInfo.price*1+" Ft");
            $(".Discount").html("-0 Ft");
            $(".Quantity").html("1");
            $(".ShipingFee").html("$0 Ft");
            $(".Total").html(notProductInfo.price+" Ft");
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
                                e.Description = "Helytelen fizetési adatokat adtál meg. Kérlek ellenőrizd és próbáld újra.";
                            }
                            Order.Alert(e.Description ? e.Description : "Ajjaj… Hiba történt.");
                        } else if (e.StatusCode == "-100") {
                            Order.Alert("Jelentkezz be a folytatáshoz.");
                        } else {
                            Order.Alert("Ajjaj… Hiba történt. Hibakód:" + e.StatusCode);
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
                    Order.Alert(e.Description ? e.Description : "Ajjaj… Hiba történt.");
                } else if (e.StatusCode == "-100") {
                    Order.Alert("Jelentkezz be a folytatáshoz.");
                } else {
                    Order.Alert("Ajjaj… Hiba történt. Hibakód:" + e.StatusCode);
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
            $(".CountyCode").html(Code).val($(".CountyCode option[class=4745]").val());
            $(".CountyList").html(Country).val($(".CountyList option[class=4745]").val());
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
                Order.Alert("A kuponkód jelenleg nem elérhető");
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
                $(".Discount").html("-" + data.CouponAmount+" Ft");
                $(".Total").html(data.PayableAmount+" Ft");
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
                    Order.Alert("Érvénytelen promóciós kód.");
                } else if (data.StatusCode == "111013") {
                    Order.Alert("Ezt a promóciós kódot már felhasználtad.");
                } else if (data.StatusCode == "111014") {
                    Order.Alert("Ezt a promóciós kódot nem tudod felhasználni ehhez a rendeléshez.");
                } else if (data.StatusCode == "111016") {
                    Order.Alert("Ez a promóciós kód lejárt vagy jelenleg nem érvényes.");
                } else if (data.StatusCode == "111017") {
                    Order.Alert("Ezt a promóciós kódot többet már nem tudod felhasználni.");
                } else {
                    Order.Alert("Ajjaj… Hiba történt. Hibakód:" + data.StatusCode);
                }
            }
        });
    },
    CreatAddreDiv: function () {
        var html = '<div class="NewOrViewed">' +
                        '<h3 style="line-height:20px;">New address</h3>' +
                        '<div id="tf-box-example" style="margin-right:10px;" class="mdc-textfield mdc-textfield--box mdc-textfield--upgraded mdc-ripple-upgraded mdc-textfield--invalid">'+
                            '<input type="text" id="tf-box" class="Email mdc-textfield__input" required="" aria-controls="name-validation-message">' +
                            '<label for="tf-box" class="mdc-textfield__label">E-mail</label>' +
                            '<div class="mdc-textfield__bottom-line"></div>'+
                        '</div>' +
                        //'<input class="Email" type="text" placeholder="Email" />' +
                        '<div id="tf-box-example" class="mdc-textfield mdc-textfield--box mdc-textfield--upgraded mdc-ripple-upgraded mdc-textfield--invalid">' +
                            '<input type="text" id="tf-box" class="Name mdc-textfield__input" required="" aria-controls="name-validation-message">' +
                            '<label for="tf-box" class="mdc-textfield__label">Címzett</label>' +
                            '<div class="mdc-textfield__bottom-line"></div>' +
                        '</div>' +
                        //'<input class="Name" type="text" placeholder="Recipient" />' +
                        '<div id="tf-box-example" style="margin-right:10px;" class="mdc-textfield mdc-textfield--box mdc-textfield--upgraded mdc-ripple-upgraded mdc-textfield--invalid">' +
                            '<input type="text" id="tf-box" class="Address mdc-textfield__input" required="" aria-controls="name-validation-message">' +
                            '<label for="tf-box" class="mdc-textfield__label">Cím</label>' +
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
                            '<label for="tf-box" class="mdc-textfield__label">Város</label>' +
                            '<div class="mdc-textfield__bottom-line"></div>' +
                        '</div>' +
                        //'<input class="City" type="text" placeholder="City" />' +
                         '<div id="tf-box-example" style="margin:10px 10px 0;" class="mdc-textfield mdc-textfield--box mdc-textfield--upgraded mdc-ripple-upgraded mdc-textfield--invalid">' +
                            '<input type="text" id="tf-box" class="State mdc-textfield__input" required="" aria-controls="name-validation-message">' +
                            '<label for="tf-box" class="mdc-textfield__label">Megye</label>' +
                            '<div class="mdc-textfield__bottom-line"></div>' +
                        '</div>' +
                        //'<input class="State" type="text" placeholder="State/Province" />' +
                        '<div id="tf-box-example" class="mdc-textfield mdc-textfield--box mdc-textfield--upgraded mdc-ripple-upgraded mdc-textfield--invalid">' +
                            '<input type="text" id="tf-box" class="ZipCode mdc-textfield__input" required="" aria-controls="name-validation-message">' +
                            '<label for="tf-box" class="mdc-textfield__label">Irányítószám</label>' +
                            '<div class="mdc-textfield__bottom-line"></div>' +
                        '</div>' +
                        //'<input class="ZipCode" type="text" placeholder="Zip code" />' +
                        '<div class="CountyCodeBox">' +
                            '<select class="CountyCode">' +

                            '</select>' +
                        '</div>' +
                        '<div id="tf-box-example" style="margin:10px 10px 0;" class="mdc-textfield mdc-textfield--box mdc-textfield--upgraded mdc-ripple-upgraded mdc-textfield--invalid">' +
                            '<input type="text" id="tf-box" class="PhoneNum mdc-textfield__input" required="" aria-controls="name-validation-message">' +
                            '<label for="tf-box" class="mdc-textfield__label">Mobiltelefon szám</label>' +
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
                    Order.Alert("Jelentkezz be a folytatáshoz.");
                } else{
                    Order.Alert("Ajjaj… Hiba történt. Hibakód:" + result.StatusCode);
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
                                        '<span class="Delete">Törlés</span>'+
                                        '<span class="edit">Módosít</span>'+
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
                    Order.Alert("Jelentkezz be a folytatáshoz.");
                } else {
                    Order.Alert("Ajjaj… Hiba történt. Hibakód:" + result.StatusCode);
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
                                    '<span class="Delete">Törlés</span>' +
                                    '<span class="edit">Módosít</span>' +
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
                    Order.Alert("Jelentkezz be a folytatáshoz.");
                } else if (result.StatusCode == "113001") {
                    Order.Alert("Több szállítási címet nem tudsz megadni! Kérlek törölj ki egyet ahhoz, hogy új címet tudj megadni.");
                } else if (result.StatusCode == "113005") {
                    Order.Alert("Kérlek érvényes telefonszámot adj meg!");
                } else if (result.StatusCode == "113007") {
                    Order.Alert("Kérlek érvényes címzettet adj meg (speciális karakterek nem használhatóak)!");
                } else if (result.StatusCode == "113008") {
                    Order.Alert("Kérlek érvényes kézbesítési címet adj meg (speciális karakterek nem használhatóak)!");
                } else {
                    Order.Alert("Ajjaj… Hiba történt. Hibakód:" + result.StatusCode);
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
                    Order.Alert("Jelentkezz be a folytatáshoz.");
                } else if (result.StatusCode == "113005") {
                    Order.Alert("Kérlek érvényes telefonszámot adj meg!");
                } else if (result.StatusCode == "113007") {
                    Order.Alert("Kérlek érvényes címzettet adj meg (speciális karakterek nem használhatóak)!");
                } else if (result.StatusCode == "113008") {
                    Order.Alert("Kérlek érvényes kézbesítési címet adj meg (speciális karakterek nem használhatóak)!");
                } else {
                    Order.Alert("Ajjaj… Hiba történt. Hibakód:" + result.StatusCode);
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
                $(".Discount").html(data.CouponAmount+" Ft");
                $(".ShipingFee").html(data.Orders[0].ShippingFee+" Ft");
                $(".Total").html(data.PayableAmount+" Ft");
                Order.AddrBoxToggle();
                if (data.PayableAmount.toFixed(0) == 0) {
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
                    Order.Alert("Jelentkezz be a folytatáshoz.");
                } else if (data.StatusCode == "111011") {
                    Order.Alert("A szállítás erre a címre nem lehetséges.");
                } else {
                    Order.Alert("Ajjaj… Hiba történt. Hibakód:" + data.StatusCode);
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
                    Order.Alert("Jelentkezz be a folytatáshoz.");
                }else {
                    Order.Alert("Ajjaj… Hiba történt. Hibakód:" + data.StatusCode);
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
                $(".UnitPrice").html(result.Orders[0].Products[0].SalePrice+" Ft");
                $(".ItemTotal").html(result.Orders[0].Products[0].SalePrice+" Ft");
                $(".Subtotal").html(result.Orders[0].SalePriceTotal+" Ft");
                $(".Discount").html("-" + result.CouponAmount+" Ft");
                $(".Quantity").html(Cookies.get("ProductCount"));
                $(".ShipingFee").html(result.Orders[0].ShippingFee+" Ft");
                $(".Total").html(result.PayableAmount+" Ft");
                $(".GoodName").html(result.Orders[0].Products[0].ProductName);
                if (Order.CouponFlag) {
                    Order.SaveCoupon();
                }
                if (a) {
                    Order.saveConsignee();
                }
            } else if (result.StatusCode == 111000) {
                Order.Alert("Ajjaj… Hiba történt. Hibakód:" + result.StatusCode);
            } else if (result.StatusCode == -100) {
                Order.Alert("Jelentkezz be a folytatáshoz.");
            } else if (result.StatusCode == 111001) {
                Order.Alert("Ajjaj… Hiba történt. Hibakód:" + result.StatusCode);
            } else if (result.StatusCode == 111007) {
                Order.Alert("Nincs ilyen termék vagy már nem elérhető.");
            } else if (result.StatusCode == 111008) {
                Order.Alert("Ez a termék jelenleg nincs raktáron.");
            } else if (result.StatusCode == 111009) {
                Order.Alert("A termék elfogyott.");
            } else if (result.StatusCode == 111010) {
                Order.Alert("Túllépted a maximálisan megvehető mennyiséget.");
            } else {
                Order.Alert("Az internetkapcsolat megszakadt, kérlek próbáld újra");
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