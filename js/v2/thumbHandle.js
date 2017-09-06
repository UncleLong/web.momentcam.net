var noFavorite = false;
var ProductThumb = (function() {
	function init(tag) {
		renderProductThumb(tag);
		GetAllThemes();
	}

	function renderProductThumb(t) {
		if(t)
			return;
		$(".productContainer .swiper-slide").eq(0).addClass("active");
		Parameters.clickCheck = false;
		Parameters.isRenderProduct = true;
		ProductHandler.GetProduct("3311530");
		//ProductHandler.GetVirtualProduct(MomentCam.urls.VirtualID);
		$(".productContainer .swiper-slide").unbind("click").on("click", function() {
			if(!Parameters.clickCheck || $(this).hasClass("active"))
				return;
			if($(this).index() == 0) {
				$(".add").css("cursor", "not-allowed").unbind("click");;

			} else {
				$(".add").css("cursor", "pointer").bind("click");
			}

			$(".CountNum").html("1");
			$(this).addClass("active").siblings().removeClass("active");
			var id = $(this).find("img").attr("data-id");
			if(id) {
				Parameters.clickCheck = false;
				Parameters.isRenderProduct = true;
				ProductHandler.GetProduct(id);
			} else {
				Parameters.FinalProductId = 424;
				Parameters.isRenderProduct = false;
				comicButtonEvent();
			}
		});
	}

	function GetAllThemes() {
		if(Parameters.RandomThemesID.length == 0) {
			var data = "language=zh&fromtype=android&appversion=1.0&coreid=5&parid=0&dataversion=1"
			CallAjax(MomentCam.urls.getallthemeUrl, data, function(result) {
				//console.log(result);
				//console.log(result["RootListJson"])
				result = result["RootListJson"].filter(function(obj) {
					return obj.Name == "大分类";
				});
				//console.log(result);
				result = result[0].StemsListJson;
				for(var property in result) {
					if(result.hasOwnProperty(property)) {
						Parameters.RandomThemesID.push(result[property].tid);
					}
				}
			});
		}
	}
	return {
		init: init
	};
})();
var Theme = (function() {
	var themeCache = {};

	function init() {
		ClickBind();
		callData(238);
	}

	function ClickBind() {
		$(".themeNav li").on("click", function(e) {
			e.stopPropagation();
			if($(this).hasClass("active"))
				return;
			var index = $(this).index();
			if(index != 0) {
				$(this).addClass("active").siblings().removeClass("active").removeClass("themeActive");
			} else {
				$(this).addClass("themeActive");
				$(".themeNav li").removeClass("active");
			}
			$("#autocomplete").val('');
			switch(index) {
				case 0:
					{
						if(!Parameters.clickCheck)
							return;
						Parameters.clickCheck = false;
						var id = Parameters.RandomThemesID[randomIntFromInterval(0, Parameters.RandomThemesID.length)];

						function randomIntFromInterval(min, max) {
							return Math.floor(Math.random() * (max - min + 1) + min);
						}
						callData(id);
						$(this).siblings().removeClass("active");
						$(".themeNav .mdc-tab-bar__indicator").hide();
						break;
					}
				case 1:
					{
						$(".themeNav .mdc-tab-bar__indicator").show();
						callData(238);
						break;
					}
				case 2:
					{
						$(".themeNav .mdc-tab-bar__indicator").show();
						if(noFavorite) {
							$(".themeThumbWrapper").hide()
							$("#noFavoriteTip").show();
							return;
						}
						$.when(POP.CheckLogin()).done(function() {
							GetFavorite();
						}).fail(function() {
							POP.ShowLogin(function() {
								GetFavorite();
							});
						});
						break;
					}
				case 3:
					{
						break;
					}
			}
		});
	}

	function GetFavorite() {
		var id = "800";
		if(!themeCache[id])
			themeCache[id] = {};

		if(themeCache[id][Parameters.Gender] == null) {
			var d = "token=" + Cookies.get('TOKEN') + "&themeid=1"
			CallAjax(MomentCam.urls.GetFavoriteUrl, d, function(result) {
				//console.log(result);
				if(result.StatusCode == "18008") {
					if(result.Items.length > 0) {
						var o = {};
						o.ResourceLst = [];

						var h = result.Items;
						for(var i = 0; i < h.length; i++) {
							var j = {};
							j.ICOPath = "Images/MomentCamColorV3/background/" + h[i].ResNumber + "03";
							j.Name = h[i].ResNumber;
							o.ResourceLst.push(j);
						}
						renderDom(o, "800");
					} else {
						noFavorite = true;
						$(".themeThumbWrapper").hide()
						$("#noFavoriteTip").show();
					}
				}
			});
		} else {
			//console.log("缓存过了");
			renderDom(themeCache[id][Parameters.Gender]);
			$("body").Loading("hide");
		}
	}

	function callData(id) {
		$("#noFavoriteTip").hide();
		$('.themeThumbWrapper').show()
		if(!themeCache[id])
			themeCache[id] = {};
		var _this = this;
		if(themeCache[id][Parameters.Gender] == null) {
			var IdObj = {};
			IdObj.localtime = "";
			IdObj.test = "";
			IdObj.language = "zh";
			IdObj.fromtype = "android";
			IdObj.appversion = "3.9";
			IdObj.themeid = id;
			IdObj.coreid = 5;
			CallAjax(MomentCam.urls.getresourceUrl, "language=zh&fromtype=android&appversion=80&extend=" + JSON.stringify(IdObj), function(result) {
				//console.log(result);
				renderDom(result, id);

			});
		} else {
			//console.log("缓存过了");
			renderDom(themeCache[id][Parameters.Gender]);
			$("body").Loading("hide");
		}
	}

	function renderDom(result, id, search) {
		Parameters.BGID = "";
		var firstID = "";
		if(Parameters.swiperObj["bg"]) {
			Parameters.swiperObj["bg"].setWrapperTranslate(0);
			Parameters.swiperObj["bg"].destroy();
		}
		var imgPathr_Arr = [];
		var imgId_Arr = [];
		var html = "";
		var container = $("#themeContainer");
		container.find(".swiper-wrapper").html('');
		var endName = MomentCam.config.isSupportWebp ? "?x-oss-process=image/format,webp/quality,q_80" : "";
		var aa = [];
		for(var i = 0; i < result.ResourceLst.length; i++) {
			var gender = result.ResourceLst[i].Name.substr(3, 1);
			var comicPath = result.ResourceLst[i].ICOPath;
			var lastSlash = comicPath.lastIndexOf("/");
			comicPath = comicPath.substring(lastSlash + 1);
			comicPath = comicPath.substring(0, comicPath.length - 2);
			if(search && !comicPath.startWith("004") && !comicPath.startWith("006")) {
				aa.push(result.ResourceLst[i].Name);
				Parameters.BGID = aa[0];
				imgId_Arr.push(result.ResourceLst[i].Name);
				imgPath = Parameters.config.ImagePrefix + result.ResourceLst[i].ICOPath + endName;
				imgPathr_Arr.push(imgPath);
			} else {
				if(!Parameters.BGID && (!comicPath.startWith("004") && !comicPath.startWith("006")) && (Parameters.Gender == gender))
					Parameters.BGID = result.ResourceLst[i].Name;
				if(!comicPath.startWith("004") && !comicPath.startWith("006") && (Parameters.Gender == gender)) {
					imgId_Arr.push(result.ResourceLst[i].Name);
					imgPath = Parameters.config.ImagePrefix + result.ResourceLst[i].ICOPath + endName;
					imgPathr_Arr.push(imgPath);
				}
			}
		}
		var html = '';
		for(var i = 0; i < imgPathr_Arr.length; i++) {
			html += '<div class="iconWrapper"><img src="' + imgPathr_Arr[i] + '" id="' + imgId_Arr[i] + '"/></div>';
		}
		if(imgPathr_Arr == 0) {
			html = "<p style='width:100%;position:absolute;left:0;top:45%;text-align:center;font-size:14px;color:#999;'>Can't find the keyword, You may like these</p>";
		}
		container.find(".swiper-wrapper").append('<div class="swiper-slide" style="position:relative;">' + html + '</div>');

		var resultOne = "",
			resultTwo = "";
		$.each(container.find(".iconWrapper"), function(i, e) {
			resultOne += " " + checkInView($(e), false, container);
			resultTwo += " " + checkInView($(e), true, container);
		});
		var firstWord = resultOne.substr(0, 4),
			endWord = resultOne.substr(resultOne.length - 4);
		//console.log(firstWord + endWord);
		changeBtn(firstWord, endWord, container);
		$("#themeContainer .swiper-container-assets").scroll(function() {
			var resultOne = "",
				resultTwo = "";
			$.each(container.find(".iconWrapper"), function(i, e) {
				resultOne += " " + checkInView($(e), false, container);
				resultTwo += " " + checkInView($(e), true, container);
			});
			var firstWord = resultOne.substr(0, 4),
				endWord = resultOne.substr(resultOne.length - 4);
			//console.log(firstWord + endWord);
			changeBtn(firstWord, endWord, container);
		});

		$("#themeContainer .iconWrapper").eq(0).find("img").eq(0).addClass("active");
		if(!themeCache[id])
			themeCache[id] = {};
		themeCache[id][Parameters.Gender] = result;
		POP.StartLoading();
		$("#themeContainer img").unbind("click").bind("click", comicButtonEvent);
//		if(Parameters.isRenderProduct) {
//			CarouseFigureMask(Parameters.MaskResult);
//		} else {
//			GoRender(Parameters.BGID, function() {
//				Parameters.clickCheck = true;
//			});
//		}
	}
	var Search = {
		getSearch: function(result, id, search) {
			console.log(result);
			renderDom(result, id, search);
		}
	}
	return {
		search: Search,
		init: init
	};
})();

function changeBtn(firstWord, endWord, container) {
	if(firstWord == " tru" && endWord == "true") {
		container.siblings(".swiper-button-prev").css({
			"background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_disabled.png)",
			"background-size": "cover"
		});
		container.siblings(".swiper-button-next").css({
			"background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_disabled.png)",
			"background-size": "cover"
		});
	} else if(firstWord == " tru" && endWord != "true") {
		container.siblings(".swiper-button-prev").css({
			"background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_disabled.png)",
			"background-size": "cover"
		});
		container.siblings(".swiper-button-next").css({
			"background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_normal.png)",
			"background-size": "cover"
		});
	} else if(firstWord != " tru" && endWord == "true") {
		container.siblings(".swiper-button-prev").css({
			"background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_normal.png)",
			"background-size": "cover"
		});
		container.siblings(".swiper-button-next").css({
			"background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_disabled.png)",
			"background-size": "cover"
		});
	} else if(firstWord != " tru" && endWord != "true") {
		container.siblings(".swiper-button-prev").css({
			"background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_normal.png)",
			"background-size": "cover"
		});
		container.siblings(".swiper-button-next").css({
			"background-image": "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_normal.png)",
			"background-size": "cover"
		});
	}
}

function changeBtns(firstWord, endWord, container) {
	if(firstWord == " tru" && endWord == "true") {
		container.parent().siblings(".swiper-button-prev").css("background-image", "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_disabled.png)");
		container.parent().siblings(".swiper-button-next").css("background-image", "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_disabled.png)");
	} else if(firstWord == " tru" && endWord != "true") {
		container.parent().siblings(".swiper-button-prev").css("background-image", "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_disabled.png)");
		container.parent().siblings(".swiper-button-next").css("background-image", "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_normal.png)");
	} else if(firstWord != " tru" && endWord == "true") {
		container.parent().siblings(".swiper-button-prev").css("background-image", "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_normal.png)");
		container.parent().siblings(".swiper-button-next").css("background-image", "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_disabled.png)");
	} else if(firstWord != " tru" && endWord != "true") {
		container.parent().siblings(".swiper-button-prev").css("background-image", "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_left_normal.png)");
		container.parent().siblings(".swiper-button-next").css("background-image", "url(https://mall-res.momentcam.net/Images/mo/v2/beauty/beauty_makeup_right_normal.png)");
	}
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
var ProductHandler = {
	GetProduct: function(pid) {
		$(".add").css({
			"background": "#fbfbfb",
			"cursor": "pointer"
		});
		if(Parameters.ProductSaver[pid]) {
			Parameters.clickCheck = true;
			this.DealProduct(Parameters.ProductSaver[pid]);
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
			success: function(result) {
				//console.log(result);
				Parameters.ProductSaver[pid] = result;

				ProductObj = result;
				_this.DealProduct(result);

			}
		});
	},
	DealProduct: function(result, isVirtual) {
		try {
			Parameters.FinalProductId = result["Product"]["ProductId"];
		} catch(e) {
			Parameters.clickCheck = true;
		}
		Parameters.SkuProduct = result["Product"].SkuGroup.SkuProduct;
		Parameters.LimitBuyCountPerOrder = result["Product"]["LimitBuyCountPerOrder"];
		Parameters.ProductStock = result["Product"]["ProductStock"];
		$(".UnitPrice span").eq(1).html("$" + result["Product"]["SalePrice"]);
		$(".rightPart span").eq(0).html("$" + result["Product"]["SalePrice"]);
		$(".CountNum").html("1");
		$(".TotlePrice span").eq(1).html("$" + Number(result["Product"]["SalePrice"]).toFixed(2));
		$(".Buy span").eq(0).html("$" + result["Product"]["SalePrice"]).show();
		Cookies.set("FinalProductId", Parameters.FinalProductId);
		$(".specList").html('').show();
		if(result["Product"]["IsSpu"] == 0) {
			this.IsSKU = false;
			if(result["Product"]["MainProductId"] == 0) {
				$(".specList").hide();
				$(".Confirm").addClass("active");
			} else {
				$(".Confirm").removeClass("active");
				var obj = result["Product"]["SkuGroup"]["SellProps"];
				for(var i = 0; i < obj.length; i++) {
					var Models = '<div class="spec" ><h3>' + obj[i]["PropName"] + '</h3><div class="specModels" PropCode="' + obj[i]["PropCode"] + '"></div></div>';
					$(".specList").append(Models);
					$(".spec").eq(i).find(".specModels").append($(obj[i].Props).map(function(i, v) {
						return '<a id="' + v.Id + '" href="javascript:void(0);" >' + v.PName + '</a>'
					}).get().join('')).find('a').click(filter);
				}
			}
		} else {
			this.IsSKU = true;
			$(".specList").show();
			var obj = result["Product"]["SkuGroup"]["SellProps"];
			for(var i = 0; i < obj.length; i++) {
				var Models = '<div class="spec" ><h3>' + obj[i]["PropName"] + '</h3><div class="specModels" PropCode="' + obj[i]["PropCode"] + '"></div></div>';
				$(".specList").append(Models);
				$(".spec").eq(i).find(".specModels").append($(obj[i].Props).map(function(i, v) {
					return '<a id="' + v.Id + '" href="javascript:void(0);" >' + v.PName + '</a>'
				}).get().join('')).find('a').click(filter);
			}
		}

		function filter() {
			if($(this).hasClass('disabled')) return;
			$(this).toggleClass('selected').siblings().removeClass('selected');
			var currentPropCode = $(this).closest(".specModels").attr('propcode');
			var selectedProps = [];
			$(".specModels").each(function() {
				var selected = $(this).find('.selected');
				if(selected.length > 0) {
					selectedProps.push({
						PropCode: $(this).attr('propcode'),
						PropValueId: selected.attr('id')
					});
				}
			});
			$(".spec").each(function() {
				var modelList = $(this).find('.specModels');
				var propCode = modelList.attr('propcode');
				if(currentPropCode == propCode) return;
				modelList.find('a').each(function() {
					$(this).removeClass("disabled");
					var aId = $(this).attr('id');
					if(!$(this).hasClass('selected')) {
						var newArr = [];
						for(var j = 0; j < selectedProps.length; j++) {
							if(selectedProps[j].PropCode != propCode) {
								newArr.push(selectedProps[j]);
							}
						}
						newArr.push({
							PropCode: propCode,
							PropValueId: aId
						});
						if(getSkuProductBySelectedProps(newArr).length == 0) {
							$(this).removeClass('selected').addClass("disabled");
						};
					}
				});
			});

			var SkuProps = Parameters.SkuProduct[0].SkuProps;
			isSelectAll = true;
			for(var i = 0; i < SkuProps.length; i++) {
				var propCode = SkuProps[i].PropCode;
				var fflag = $(".spec").find("[propcode='" + propCode + "']").find("a").hasClass('selected') ? $(".spec").find("[propcode='" + propCode + "']").find("a.selected").attr("id") : undefined;
				if(!fflag) {
					isSelectAll = false;
					break;
				}
			}

			if(isSelectAll) {
				var b = [];
				//$(".tips").html("请选择规格！").hide();
				for(var i = 0; i < SkuProps.length; i++) {
					var propCode = SkuProps[i].PropCode;
					var fflag = $(".spec").find("[propcode='" + propCode + "']").find("a").hasClass('selected') ? $(".spec").find("[propcode='" + propCode + "']").find("a.selected").attr("id") : undefined;
					var o = {};
					o.name = SkuProps[i].PropCode;
					o.id = fflag;
					if(fflag)
						b.push(o);
				}
				$(".Confirm").addClass("active");
				var mainobject = ProductHandler.GetFinalProductId(b);
				if(mainobject != null && mainobject.ProductStock > 0) {
					Parameters.FinalProductId = mainobject.ProductId;
					Cookies.set("FinalProductId", Parameters.FinalProductId);
					Parameters.ProductNum = mainobject.ProductStock;
					$(".UnitPrice span").eq(1).html("$" + ProductObj["Product"]["SalePrice"]);
					$(".TotlePrice span").eq(1).html("$" + Number(ProductObj["Product"]["SalePrice"]) * Number($(".CountNum").html()).toFixed(2));
				} else {
					//$.dialog.tips("缺货");
				}
			} else {
				$(".Confirm").removeClass("active");
				$(".UnitPrice span").eq(1).html("$" + ProductObj["Product"]["SalePrice"]);
				$(".TotlePrice span").eq(1).html("$" + Number(ProductObj["Product"]["SalePrice"]) * Number($(".CountNum").html()).toFixed(2));
			}

			$('#Product a').each(function() {
				hit = true;
				for(var i = 0; i < SkuProps.length; i++) {
					var propCode = SkuProps[i].PropCode;
					var hflag = $(".spec").find("[propcode='" + propCode + "']").find("a").hasClass('selected') ? $(".spec").find("[propcode='" + propCode + "']").find("a.selected").attr("id") : undefined;
					if(hit && hflag) {
						hit = this.getAttribute(propCode) == hflag;
					}
				}
				this.className = hit ? '' : 'disabled';
				flag = false; //购买不可选
				if(isSelectAll) {
					var vflag = true;
					for(var i = 0; i < SkuProps.length; i++) {
						var propCode = SkuProps[i].PropCode;
						var value = this.getAttribute(propCode);
						var cflag = $(".spec").find("[propcode='" + propCode + "']").find("a").hasClass('selected') ? $(".spec").find("[propcode='" + propCode + "']").find("a.selected").attr("id") : undefined;

						if(value != cflag) {
							vflag = false;
							break;
						}
					}
					if(vflag) {
						if(this.getAttribute('productstock') == 0 || this.getAttribute('productstock') < Parameters.BuyCount) {
							$.dialog.tips("Nem elegendő készlet, a kiválasztott modellek további" + this.getAttribute('productstock') + "modellje");
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
		if(Parameters.isRenderProduct) {
			CarouseFigureMask(result);
		}
	},
	GetVirtualProduct: function(pid, reget) {
		ProductObj = null;
		$(".GoodName").html("MomentCam Caricature (Digital)");
		$(".reduce").css({
			"background": "#f5f5f5",
			"cursor": "not-allowed"
		});
		$(".add").css({
			"background": "#fbfbfb",
			"cursor": "not-allowed"
		});
		if(!$.isEmptyObject(Parameters.virtualObj)) {
			getVirtual(Parameters.virtualObj);
			return;
		}
		CallAjax(MomentCam.urls.getProductInfo, "id=" + pid, function(result) {
			getVirtual(result);
		});

		function isAO(str) {
			if(str instanceof Array || str instanceof Object) {
				return true
			}
			return false
		}

		function getVirtual(result) {
			if(isAO(result)) {

				Parameters.virtualObj = result;
			} else {
				result = JSON.parse(result);
				Parameters.virtualObj = result;
			}

			// console.log(result);
			$(".UnitPrice span").eq(1).html("$" + result["price"]);
			$(".CountNum").html("1");
			$(".TotlePrice span").eq(1).html("$" + Number(result["price"]).toFixed(2));
			if(result["price"] != 0) {
				$(".Buy span").eq(0).html("$" + result["price"]).show();
			}
			Cookies.set("FinalProductId", pid);
			Parameters.ProductID = pid;
			Parameters.FinalProductId = pid;
			$(".specList").html('').hide();
			if(reget) {
				ConfirmOrder.init();
			}
		}
	},
	GetFinalProductId: function(arr) {
		var parents = Parameters.SkuProduct;
		for(var i = 0; i < parents.length; i++) {
			var mainobject = parents[i]; // a potential parent
			var temp = 0;
			for(var g = 0; g < arr.length; g++) {
				for(var skuChild in mainobject.SkuProps) {
					if(mainobject.SkuProps.hasOwnProperty(skuChild)) {
						if(mainobject.SkuProps[skuChild].PropCode == arr[g].name && mainobject.SkuProps[skuChild].PropValueId == arr[g].id) {
							temp++;
							if(temp == arr.length) {
								return mainobject;
							}
						}
					}
				}
			}
		}
	},

}

function generateUUID() { // Public Domain/MIT 
	var d = new Date().getTime();
	if(typeof performance !== 'undefined' && typeof performance.now === 'function') {
		d += performance.now(); //use high-precision timer if available
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return(c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

function getSkuProductBySelectedProps(arr) {
	var ret = $.grep(Parameters.SkuProduct, function(sku) {
		var restarr = $.grep(arr, function(value) {
			return getProductPropValue(sku, value.PropCode) != value.PropValueId;
		});
		return restarr.length == 0 && sku.ProductStock > 0;
	});
	return ret;
}

function getProductPropValue(prod, propCode) {
	var ret = null;
	$(prod.SkuProps).each(function() {
		if(this.PropCode == propCode) {
			ret = this.PropValueId;
		}
	});
	return ret;
}

function comicButtonEvent() {
	if(!Parameters.clickCheck || $(this).hasClass("active"))
		return;
	Parameters.clickCheck = false;
	$(this).addClass("active").parent().siblings().find("img").removeClass("active");
	var id = $(this).attr("id");
	if(id)
		Parameters.BGID = id;
	if(Parameters.isRenderProduct) {
		CarouseFigureMask(Parameters.MaskResult);
	} else {
		GoRender(Parameters.BGID, function() {
			Parameters.clickCheck = true;
		});
	}
}

function CarouseFigureMask(result, update) {
	Parameters.clickCheck = false;
	var _this = this;
	POP.StartLoading();
	$(".ComicShow").addClass("NoBorder");
	if(Parameters.bgSaver[result["Product"]["BannerImages"][0].BkgdImg] && !update) {
		// console.log(Parameters.bgSaver[result["Product"]["BannerImages"][0].BkgdImg][Parameters.BGID])
		if(Parameters.bgSaver[result["Product"]["BannerImages"][0].BkgdImg][Parameters.BGID] != undefined) {
			var Path = Parameters.bgSaver[result["Product"]["BannerImages"][0].BkgdImg][Parameters.BGID];
			//Parameters.Thumb = Path;
			$("[name='renderResult']").attr("src", Path).hide().fadeIn(300);
			$(".CoverMask").hide();
			POP.CloseLoading();
			$(".Buy span").eq(0).html("$" + result["Product"]["SalePrice"]).show();
			Parameters.clickCheck = true;
			return;
		}

	}
	var AC = {};

	AC.EmbedImageUrl = "";
	AC.BackImageUrl = result["Product"]["BannerImages"][0].BkgdImg;
	AC.MaskImageUrl = result["Product"]["BannerImages"][0].ImagePath;
	var points = JSON.stringify(GetLocationPoints(result["Product"]["BannerImages"][0].LocationPoints));

	function GetLocationPoints(points) {
		var ARR = [];
		for(var i = 0; i < points.length; i++) {
			var ss = points[i].split(",");
			ARR.push(Number(ss[0]));
			ARR.push(Number(ss[1]));
		}
		return ARR;
	}
	AC.P4 = JSON.parse(points);
	AC.BackgroundName = Parameters.BGID + "02";
	AC.Heads = [];
	AC.Heads.push({
		"Key": Parameters.FACEUID,
		"Value": 0
	});
	Parameters.Heads = AC.Heads;
	AC.GrayStyle = 1;
	//AC.AddWaterMark = 1;
	AC.ImageFormatType = 0;
	jQuery.ajax({
		type: "post",
		async: true,
		url: MomentCam.urls.carouseFigureMaskUrl,
		timeout: 25000,
		cache: false,
		data: "json=" + JSON.stringify(AC),
		success: function(data) {
			//console.log(data);
			data = JSON.parse(data);
			if(data.StatusCode == 4363601) {
				
				data.Path = data.Path.replace("square-ali.manboker.com", "square.oss-cn-hangzhou.aliyuncs.com").replace("production-us.manboker.com", "moman-production-us.oss-us-west-1.aliyuncs.com");
				if(!Parameters.bgSaver[AC.BackImageUrl])
					Parameters.bgSaver[AC.BackImageUrl] = {};
				Parameters.link = data.Path;
				data.Path = data.Path + Parameters.RenderPrefix + "/resize,w_550";
				Parameters.bgSaver[AC.BackImageUrl][Parameters.BGID] = data.Path;
				Parameters.Thumb = data.Path;
				loadImage(data.Path, function() {
					$("[name='renderResult']").attr("src", data.Path).hide().fadeIn(300);
					if(Parameters.isRenderProduct) {
						$(".ComicShow").addClass("NoBorder");
					} else {
						$(".ComicShow").removeClass("NoBorder");
					}
					$(".CoverMask").hide();
					POP.CloseLoading();
					Parameters.clickCheck = true;
				});
			} else {
				console.log(data);
			}
		},
		error: function(e) {}
	});
}
var ConfirmFlag = false,
	isSelectAll = false;
var BindEvent = {
	init: function() {
		$(".swiper-button-next").on("click", function() {
			$($(this).parent().find(".swiper-wrapper")).animate({
				scrollLeft: "+=650",
			}, 500, function() {

			});
		});
		$(".swiper-button-prev").on("click", function() {
			$($(this).parent().find(".swiper-wrapper")).animate({
				scrollLeft: "-=650",
			}, 500, function() {});
		});
		$(".resetGroup .a").on("click", function() {
			window.location.href = "beauty.html?v=" + Math.random();
		});
		$(".resetGroup .b").on("click", function() {
			window.parent.location.href = window.parent.location.href.split("?")[0];
		});
		$(".Buy").on("click", this.BuyClick);
		$(".order_Main,.chooseSpec").on("click", function() {
			return false;
		});
		$(".chooseSpecCover").not(".addAddress").on("click", function() {
			if(ConfirmFlag) {
				Confirm("malesss");
			} else {
				$(".chooseSpecCover").fadeOut();

				$(".chooseSpec").animate({
					"right": "-552px"
				}, 300);
				$(".order_Main").animate({
					"right": "-1034px"
				}, 300);
			}
		});
		$(".UseCodeBtn").on("click", function() {
			Confirm("u");
		});
		$(".Confirm").on("click", function() {
			$(".Code input").val("");
			$(".productName span").eq(1).html("");
			if(Parameters.isRenderProduct) {
				$(".EmailBox").hide();
				$(".EmailBox input").val("");
				$(".addressesBox").show();
			} else {
				$(".EmailBox").show();
				$(".EmailBox input").val("");
				$(".addressesBox").hide();
			}
			Cookies.set("isRenderProduct", Parameters.isRenderProduct);
			Cookies.set("Parameters", Parameters.virtualObj);
			if(isSelectAll) {
				Cookies.set("ProductCount", $(".CountNum").html());
				Cookies.set("ProductImg", $("[name='renderResult']").attr("src"));
				window.location.href = "order.html?v=" + Math.random();
			} else {
				if($(".specList").css("display") == "none") {
					Cookies.set("ProductCount", $(".CountNum").html());
					Cookies.set("ProductImg", $("[name='renderResult']").attr("src"));
					window.location.href = "order.html?v=" + Math.random();
				} else {
					POP.Alert("Please select model!");
				}
			}
		});
		//提交订单
		$(".submitButton").on("click", function() {
			if(!Parameters.clickCheck)
				return;
			//if ($(".boxAddress").length == 0) {
			//    POP.Alert("Invalid address");
			//    return;
			//}
			ConfirmOrder.SubmitOrder(Parameters.isRenderProduct);

		});
		//减少商品
		$(".reduce").on("click", function() {
			if(Number($(".CountNum").html()) == 1) {
				return;
			}
			Parameters.BuyCount = Number($(".CountNum").html());
			var minNum = 1;
			if(Parameters.ProductStock == 0) {
				minNum = 0;
			}
			if(Parameters.BuyCount <= minNum) {
				Parameters.BuyCount = minNum;
			} else {
				Parameters.BuyCount--;
			}
			if(Parameters.BuyCount > 1) {
				$(".reduce").css({
					"background": "#f5f5f5",
					"cursor": "pointer"
				});
			} else {
				$(".reduce").css({
					"background": "#fbfbfb",
					"cursor": "not-allowed"
				});
			}
			$(".CountNum").html(Parameters.BuyCount);
			var price = 0;
			if(!ProductObj)
				price = 9.99;
			else
				price = ProductObj["Product"]["SalePrice"];
			$(".TotlePrice span").eq(1).html("$" + (Number(price) * Number($(".CountNum").html())).toFixed(2));
		});
		//增加商品
		$(".add").on("click", function() {
			Parameters.BuyCount = Number($(".CountNum").html());
			var limitCount = 0;
			var showinfo = "";
			if(ProductObj) {
				if(Parameters.ProductStock > Parameters.LimitBuyCountPerOrder) {
					limitCount = Parameters.LimitBuyCountPerOrder;
					showinfo = "每件商品限购" + limitCount + "件";
				} else {
					limitCount = Parameters.ProductStock;
					showinfo = "资源紧张，库存不足！";
				}
			} else {
				$(".add").css({
					"background": "#fbfbfb",
					"cursor": "not-allowed"
				});
				limitCount = 1;
			}
			if(Parameters.BuyCount >= limitCount) {
				Parameters.BuyCount = limitCount;
			} else {
				Parameters.BuyCount++;
			}
			if(Parameters.BuyCount > 1 && ProductObj) {
				$(".reduce").css({
					"background": "#f5f5f5",
					"cursor": "pointer"
				});
				$(".add").css({
					"background": "#fbfbfb",
					"cursor": "pointer"
				});
			} else {
				$(".reduce").css({
					"background": "#fbfbfb",
					"cursor": "not-allowed"
				});
			}
			$(".CountNum").html(Parameters.BuyCount);
			var price = 0;
			if(!ProductObj)
				price = 9.99;
			else
				price = ProductObj["Product"]["SalePrice"];

			$(".TotlePrice span").eq(1).html("$" + ((Number(price)) * Number($(".CountNum").html())).toFixed(2));
		});
	},
	BuyClick: function(e) {
		e.preventDefault();
		e.stopPropagation();
		if(!Parameters.clickCheck)
			return;
		$.when(POP.CheckLogin())
			.done(function() {
				BindEvent.Buy();
			})
			.fail(function() {
				//Alert("You have to login first");
				POP.ShowLogin(function() {
						BindEvent.Buy();
					})
					//Confirm("login");
			});
	},
	Buy: function() {
		try {
			if(fbq) {
				fbq('track', 'BuyNow', {
					resourceID: [Parameters.BGID],
					productID: [Cookies.get("FinalProductId")]
				});
			}
		} catch(e) {}
		//$(".chooseSpecCover").fadeIn();
		//$(".chooseSpec").animate({ "right": "0" }, 300);
		ConfirmFlag = false;
		var data = 'token=' + Cookies.get('TOKEN') + '&json={BackgroundName:\"' + Parameters.BGID + "02" + '",Heads:' + JSON.stringify(Parameters.Heads) + ',GrayStyle:1}';
		CallAjax(MomentCam.urls.syncOrderDataUrl, data, function(result) {
			if(result.StatusCode == 4363441) {
				Parameters.DataUID = result.DataUID;
				Cookies.set("isRenderProduct", Parameters.isRenderProduct);
				Cookies.set("Parameters", Parameters.virtualObj);
				Cookies.set("ProductImg", $("[name='renderResult']").attr("src"));
				Cookies.set("FinalProductId", Parameters.FinalProductId);
				Cookies.set("CartoonCode", Parameters.BGID);
				Cookies.set("DataUid", Parameters.DataUID);
				location.href = "order.html?v=" + Math.random();
			} else {
				POP.Alert("Az internetkapcsolat megszakadt, kérlek próbáld újra");
			}
		});
	}
}

function GoRender(bg, callback) {
	var _ = this;
	$(".specList").html('').hide();
	$(".Btns").find(".Buy").hide().end().find(".Share").css("float", "none").css("background-repeat", "no-repeat").css("margin", "0 auto");
	if(bg && Parameters.RenderSaver[bg]) {
		Parameters.clickCheck = true;
		//console.log(Parameters.RenderSaver[bg].Path);
		Parameters.link = Parameters.RenderSaver[bg].Path;
		$("[name='renderResult']").attr("src", (Parameters.RenderSaver[bg].Path).replace("http:", "https:"));
		$(".CoverMask").hide();
		POP.CloseLoading();
		if(callback)
			return callback("");
		return;
	} else {
		Parameters.RenderSaver[bg] = {};
	}
	POP.StartLoading();
	var json = {};
	if(!bg) {
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
	json.WaterMarkUrl = "https://mall-res.momentcam.net/Images/watermark.png";
	json.ImageFormatType = MomentCam.config.isSupportWebp ? 2 : 2;
	CallAjax(MomentCam.urls.serverRender, "json=" + JSON.stringify(json), function(result) {
		result.Path = result.Path.replace("square-ali.manboker.com", "square.oss-cn-hangzhou.aliyuncs.com").replace("production-us.manboker.com", "moman-production-us.oss-us-west-1.aliyuncs.com");
		result.Path = result.Path + Parameters.RenderPrefix + "/resize,w_550";
		loadImage(result.Path, function() {
			Parameters.clickCheck = true;
			Parameters.RenderSaver[bg].Path = result.Path;
			Parameters.link = result.Path;
			$(".ComicShow").removeClass("NoBorder");
			$("[name='renderResult']").attr("src", (result.Path).replace("http:", "https:")).hide().fadeIn(300);
			$(".CoverMask").hide();
			POP.CloseLoading();
			if(callback)
				return callback("");
		});
	});
}