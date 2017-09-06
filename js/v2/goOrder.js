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
                $(".TotlePrices span").eq(1).html((Number(ProductObj["Product"]["SalePrice"]) * Number(num))+" Ft");
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
                $(".TotlePrices span").eq(1).html((Number(price) * Number($(".CountNums").val()))+" Ft");
            });
            //增加商品
            $(".reduce").on("click", function () {
                Parameters.BuyCount = Number($(".CountNums").val());
                var limitCount = 0;
                var showinfo = "";
                if (ProductObj) {
                    if (Parameters.ProductStock > Parameters.LimitBuyCountPerOrder) {
                        limitCount = Parameters.LimitBuyCountPerOrder;
                        showinfo = limitCount + "darab minden elemhez";
                    } else {
                        limitCount = Parameters.ProductStock;
                        showinfo = "Erőforráshiány, készlethiány！";
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

                $(".TotlePrices span").eq(1).html(((Number(price)) * Number($(".CountNums").val()))+" Ft");
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
            $(".UnitPrices span").eq(1).html(result["Product"]["SalePrice"]+" Ft");
            $(".Amount span").eq(1).html("1");
            $(".TotlePrices span").eq(1).html(Number(result["Product"]["SalePrice"])+" Ft");
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
                        $(".UnitPrices span").eq(1).html(ProductObj["Product"]["SalePrice"]+" Ft");
                        $(".TotlePrices span").eq(1).html(Number(ProductObj["Product"]["SalePrice"]) * Number($(".CountNums").val())+" Ft");
                    } else {
                        //$.dialog.tips("缺货");
                    }
                } else {
                    $(".Confirm").removeClass("active");
                    $(".UnitPrices span").eq(1).html(ProductObj["Product"]["SalePrice"]+" Ft");
                    $(".TotlePrices span").eq(1).html(Number(ProductObj["Product"]["SalePrice"]) * Number($(".CountNums").val())+" Ft");
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
                                Order.Alert("Sajnos az általad választott termékből nem áll rendelkezésre" + this.getAttribute('productstock') + "darab.");
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
                $(".UnitPrices span").eq(1).html(result["price"]+" Ft");
                $(".Amount span").eq(1).html("1");
                $(".TotlePrices span").eq(1).html(Number(result["price"])+" Ft");
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