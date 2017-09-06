var Parameters = {
    FACEUID: localStorage.getItem('faceuid') || "",
    offset: localStorage.getItem('offsetY') || 0,
    clickCheck: false,
    SwiperObject: {},
    Gender: localStorage.getItem('gender') || 1,
    swiperObj: {},
    RenderSaver: {},
    AttachData: [],
    assetsSaver: {},
    selectSaver: {},
    bgSaver: {},
    dy: 0,
    skinArr: [],
    isRenderProduct: false,
    iconActiveSaver:{},
    RandomThemesID: [],
    ProductSaver: {},
    hairColor: "057",
    config: {
        ImagePrefix: "https://mall-res.momentcam.net/",
    },
    swiperObj: {},
    RenderPrefix: MomentCam.config.isSupportWebp ? "?x-oss-process=image/format,webp/quality,q_80" : "",
    savePrefix: MomentCam.config.isSupportWebp ? "?x-oss-process=image/format,jpg/quality,q_50" : "",
    BGID: "",
    femaleBG: "0052100060626002",
    maleBG: "0051100060625002",
    virtualObj: {},
    iconActiveSaver: {}
}
function loadImage(a, b) {
    var c = new Image;
    c.onload = function () {
        c.onload = null,
        b(c)
    },
    c.src = a
}
$(function () {
    $(document).on('click', 'body *', function () {
        try {
            window.parent.hiding();
        } catch (e) { }
    });
    $(".fairPicShow img").on("dragstart", function () {
        return false;
    });
});
function Confirm(g) {
    if (g == "u") {
        if (!$(".Code input").val()) {
            POP.Alert("Coupon code is empty");
            return;
        }
    }

    $(".confirm").fadeIn();
    $(".confirm .FaileSure").html("Leave");
    if (g == "u") {
        $(".ReleaseFaile p").html("Biztosan felhasználod a kuponkódot? Ha a 'megerősítés' gombra kattintasz, a kupon felhasználásra kerül, akkor is, ha nem véglegesíted a megrendelésed.");
        $(".confirm .FaileSure").html("Confirm");
        $(document).one("click", ".FaileSure", function () {
            $(".confirm").fadeOut(function () {
                Coupon.init();
                $(".Code input").val("");
            });
        });
        $(".sSure").one("click", function () {
            $(".confirm").fadeOut();
            $(".Code input").val("");
        });
    } else if (g == "login") {
        $(document).one("click", ".FaileSure", function () {
            $(".cover").fadeOut();
            return false;
        });
    } else {
        if ($(".ReleaseFaile p").html() == "Please select model!") {
            $(".cover").fadeOut();
            return;
        }
        $(".ReleaseFaile p").html("Amennyiben kilépsz, megrendelésed törlésre kerül");
        $(document).one("click", ".FaileSure", function () {
            $(".confirm").fadeOut(function () {
                Parameters.virtualObj = null;
                $(".fairColorList img").eq(0).attr("data-id", MomentCam.urls.VirtualID);
                // Cartoon.GetVirtualProduct(MomentCam.urls.VirtualID, true);
                $(".cover").fadeOut();
                $(".boxAddress,.showAll").remove();
                $(".chooseSpecCover").fadeOut();
                $(".chooseSpec").animate({ "right": "-552px" }, 300);
                $(".order_Main").animate({ "right": "-1034px" }, 300);
            });
        });
        $(".sSure").one("click", function () {
            $(".confirm").fadeOut();
        });
    }
}

