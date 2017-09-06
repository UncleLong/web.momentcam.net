(function () {
    var LastSearchContent = "";
    var Search = {
        result: {},
        getContent: function (content, id) {
            $(".swiper-slide").removeClass("active");
            if (!content)
                return;
            $.getJSON(MomentCam.urls.searchResourceUrl, "word=" + content + "&pageNum=1&pageCount=50&fromtype=ios&appversion=3.1.0&language=en&personType=1&personCount=1&coreid=5", function (result) {
                Theme.search.getSearch(result, id,true);
            });
        }
    }
    
    $(".searchContent span").on("click", function () {
        if ($("#autocomplete").hasClass("active")) {
            $("#basic-tab-bar").hide();
            $(".searchContent").animate({ "width": "60%" }, 200, function () {
                $("#autocomplete").width($(".searchContent").width() - 46).removeClass("active").focus();
            });
        } else {
            $(".themeNav li").removeClass("themeActive").removeClass("active");
            Search.getContent($("#autocomplete").val(), generateUUID());
            LastSearchContent = $("#autocomplete").val();
        }
    });
    $(".inputClear").on("click", function () {
        $(".autocomplete-suggestions").hide();
        $("#autocomplete").val("").blur();
        $(".searchContent").animate({ "width": "36px" }, 200, function () {
            $("#autocomplete").addClass("active");
            $("#basic-tab-bar").show();
            $(".themeNav li").eq(1).trigger("click");
        });
        return false;
    });
    $("#autocomplete").bind("keypress", function (i) {
        if (i.keyCode == "13") {
            if (LastSearchContent == $("#autocomplete").val())
                return;
            $(".themeNav li").removeClass("themeActive").removeClass("active");
            Search.getContent($("#autocomplete").val(), generateUUID());
            LastSearchContent = $("#autocomplete").val();
            i.preventDefault ? i.preventDefault() : i.returnValue = false;
        }
    });
    $('#autocomplete').autocomplete({
        lookup: function (query, done) {
            var names = [];
            var q = $("#autocomplete").val();
            $.getJSON(MomentCam.urls.searchThemeUrl, "word=" + q + "&pageNum=1&pageCount=50&fromtype=ios&appversion=3.1.0&language=en&personType=1&personCount=1&coreid=5", function (data) {
                models = [];
                $.each(data.Rows, function (key, val) {
                    var o = {
                        'value': val.value,
                        'data': val.id
                    };
                    names.push(o);
                });
                $(".themeNav li").removeClass("themeActive").removeClass("active");
                $(".mdc-tab-bar__indicator").hide();
                Search.result.suggestions = names;
                done(Search.result);
            });
        },
        onSelect: function (suggestion) {
            console.log('You selected: ' + suggestion.value + ', ' + suggestion.data);
            LastSearchContent = "";
            Search.getContent(suggestion.value, suggestion.data);
        }
    });
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