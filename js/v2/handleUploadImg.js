'use strict';
function GetUploadImage(f, type, callback) {
    var uploadImg = new Image();
    var canvas = null;
    var ctx = null;
    if (type == "upload") {
        window.URL = window.URL || window.webkitURL;
        uploadImg.src = window.URL.createObjectURL(f);
        canvas = document.getElementById("canvas");
    } else {
        canvas = document.getElementById("canvasCemara");
        uploadImg.src = canvas.toDataURL("image/png");
    }
    ctx = canvas.getContext("2d");
    var img = new Image();
    img.src = uploadImg.src;
    var _this = this;
    img.onload = function () {
        getOrientation(f, function (orientation) {
            var maxlength = 700;
            var oc = document.createElement('canvas'),
                octx = oc.getContext('2d');
            if (img.width >= img.height && img.width > maxlength) {
                oc.width = maxlength;
                oc.height = maxlength * img.height / img.width;

                oc.height = oc.height + (4 - (oc.height % 4 == 0 ? 4 : oc.height % 4));

            } else if (img.width < img.height && img.height > maxlength) {
                oc.height = maxlength;
                oc.width = maxlength * img.width / img.height;

                oc.width = oc.width + (4 - (oc.width % 4 == 0 ? 4 : oc.width % 4));
            } else {
                oc.width = img.width + (4 - (img.width % 4 == 0 ? 4 : img.width % 4));
                oc.height = img.height + (4 - (img.height % 4 == 0 ? 4 : img.height % 4));
            }
            octx.drawImage(img, 0, 0, oc.width, oc.height);
            octx.drawImage(oc, 0, 0, oc.width, oc.height);
            canvas.width = oc.width;
            canvas.height = oc.height;
            if (orientation == 8 || orientation == 6 || orientation == 3) {
                ctx.save();
                if (orientation == 8 || orientation == 6) {
                    canvas.width = oc.height;
                    canvas.height = oc.width;
                    if (orientation == 6) {
                        ctx.translate(oc.height, 0);
                    } else {
                        ctx.translate(0, oc.width);
                    }

                } else if (orientation == 3) {
                    ctx.translate(oc.width, oc.height);
                } else {
                    ctx.translate(oc.width, 0);
                }
                var deg;
                if (orientation == 8) {
                    deg = -90;
                } else if (orientation == 3) {
                    deg = -180;
                } else {
                    deg = 90;
                }
                ctx.rotate(deg * (Math.PI / 180));
                if (orientation == 3) {
                    ctx.drawImage(oc, 0, 0, oc.width, oc.height, 0, 0, canvas.width, canvas.height);
                } else {
                    ctx.drawImage(oc, 0, 0, oc.width, oc.height, 0, 0, canvas.height, canvas.width);
                }
                ctx.restore();
            } else {
                ctx.drawImage(oc, 0, 0, oc.width, oc.height,
                    0, 0, canvas.width, canvas.height);
            }
            var dataURL = canvas.toDataURL("image/jpeg");
            var blobBin = atob(dataURL.split(',')[1]);
            var array = [];
            for (var i = 0; i < blobBin.length; i++) {
                array.push(blobBin.charCodeAt(i));
            }
            var file = new Blob([new Uint8Array(array)], {
                type: 'image/jpeg'
            });
            var formData = new FormData();
            formData.append('file', file);
            formData.append("FilePurpose", "Photo");
            formData.append('filename', "file.jpeg");
            $.ajax({
                type: 'post',
                url: "https://imgupload.momentcam.net/api/Image/Upload",
                data: formData,
                timeout: 20000,
                success: function (result) {
                    return callback(result);
                },
                error: function (e) {
                    return callback(e);
                },
                processData: false,
                contentType: false,
            });
        });
    }
    function getOrientation(file, callback) {
        if (!file)
            return callback(-1);
        var reader = new FileReader();
        reader.onload = function (e) {
            var view = new DataView(e.target.result);
            if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
            var length = view.byteLength,
                offset = 2;
            while (offset < length) {
                var marker = view.getUint16(offset, false);
                offset += 2;
                if (marker == 0xFFE1) {
                    if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
                    var little = view.getUint16(offset += 6, false) == 0x4949;
                    offset += view.getUint32(offset + 4, little);
                    var tags = view.getUint16(offset, little);
                    offset += 2;
                    for (var i = 0; i < tags; i++)
                        if (view.getUint16(offset + (i * 12), little) == 0x0112)
                            return callback(view.getUint16(offset + (i * 12) + 8, little));
                } else if ((marker & 0xFF00) != 0xFF00) break;
                else offset += view.getUint16(offset, false);
            }
            return callback(-1);
        };
        reader.readAsArrayBuffer(file);
    }
}