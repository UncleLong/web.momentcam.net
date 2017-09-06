!function (a) {
    var b = {
        init: function (b, c) {
            b || (b = "");
            var d = ' <div class="HuiCeng" style="display: block;width: 100%;height: 100%;background: rgba(0,0,0,.4);position: fixed;top: 0;left: 0;z-index: 99999;">'+
                        '<div class="loading" style=" width: 200px;left: 50%; margin-left: -100px;top: 40%; z-index: 99999; position: absolute; text-align: center;opacity: 1;">'+
                            '<div role="progressbar" class="mdc-linear-progress mdc-linear-progress--indeterminate">'+
							    '<div class="mdc-linear-progress__buffering-dots"></div>'+
							    '<div class="mdc-linear-progress__buffer"></div>'+
							    '<div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">'+
								    '<span style="background:#b72a3d;" class="mdc-linear-progress__bar-inner"></span>' +
							    '</div>'+
							    '<div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">'+
								    '<span style="background:#b72a3d;" class="mdc-linear-progress__bar-inner"></span>'+
							    '</div>'+
						    '</div>' +
                            '<p style="font-size: 37px;margin-top:25px; color: white;">' + b + "</p>" + 
                        "</div>" + 
                    "</div>";
            a("body").html().indexOf("HuiCeng") > 0 ? a(this).find(".HuiCeng").find("p").html(b) : a(this).append(d).find(".HuiCeng").hide().fadeIn(300), c && a(this).find(".HuiCeng").find("p").css("color", c)
        },
        hide: function () {
            a(".HuiCeng").fadeOut(300, function () {
                a(this).remove()
            })
        }
    };
    a.fn.Loading = function (a) {
        return b[a] ? b[a].apply(this, Array.prototype.slice.call(arguments, 1)) : b.init.apply(this, arguments)
    }
}(jQuery);