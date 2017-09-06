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