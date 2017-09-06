var PayOrder = {
    JumpToReturnUrl: function () {
        if (PayOrder.ReturnUrl) {
            location.href = PayOrder.ReturnUrl;
        } else {
            location.href = "paysuccess.html";
        }
    },
    GetUrlParam: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    },
    CreateCredit: function (clientInstance) {
        braintree.hostedFields.create({
            client: clientInstance,
            styles: {
                'input': {
                    'font-size': '14px',
                    'font-family': 'roboto, verdana, sans-serif',
                    'font-weight': 'lighter',
                    'color': 'black',
                    '-moz-transition': 'border .3s linear',
                    '-o-transition': 'border .3s linear',
                    '-webkit-transition': 'border .3s linear',
                    'transition': 'border .3s linear',
                },
                'input:focus': {
                    'color': '#b72a3d',
                    'border': "1px solid #b72a3d"
                },
                '.valid': {
                    'color': 'black'
                },
                '.invalid': {
                    'color': 'red'
                }
            },
            fields: {
                number: {
                    selector: '#card-number',
                    placeholder: 'Card Number'
                },
                cvv: {
                    selector: '#cvv',
                    placeholder: 'CVV'
                },
                expirationDate: {
                    selector: '#expiration-date',
                    placeholder: 'Month/Year'
                }
            }
        }, function (err, hostedFieldsInstance) {
            if (err) {
                PayOrder.ErrorCallback({ StatusCode: 1, Description: err.message });
                return;
            }

            hostedFieldsInstance.on('focus', function (event) {
                var field = event.fields[event.emittedBy];

                $(field.container).next('.hosted-field--label').addClass('label-float').removeClass('filled');
            });

            // Emulates floating label pattern
            hostedFieldsInstance.on('blur', function (event) {
                var field = event.fields[event.emittedBy];

                if (field.isEmpty) {
                    $(field.container).next('.hosted-field--label').removeClass('label-float');
                } else if (event.isValid) {
                    $(field.container).next('.hosted-field--label').addClass('filled');
                } else {
                    $(field.container).next('.hosted-field--label').addClass('invalid');
                }
            });

            hostedFieldsInstance.on('empty', function (event) {
                var field = event.fields[event.emittedBy];

                $(field.container).next('.hosted-field--label').removeClass('filled').removeClass('invalid');
            });

            hostedFieldsInstance.on('validityChange', function (event) {
                var field = event.fields[event.emittedBy];

                if (field.isPotentiallyValid) {
                    $(field.container).next('.hosted-field--label').removeClass('invalid');
                } else {
                    $(field.container).next('.hosted-field--label').addClass('invalid');
                }
            });

            $(PayOrder.SubmitButtonId).unbind('click').click(function (event) {
                //$("body").Loading("");
                event.preventDefault();

                hostedFieldsInstance.tokenize(PayOrder.SendNonceToServer);
            });
            PayOrder.SuccessCallback();
        });
    },
    CreatePaypal: function (clientInstance) {
        braintree.paypal.create({
            client: clientInstance
        }, function (paypalErr, paypalInstance) {
            if (paypalErr) {
                PayOrder.ErrorCallback({ StatusCode: 1, Description: paypalErr.message });
                return;
            }
            $(PayOrder.SubmitButtonId).unbind('click').click(function () {
                paypalInstance.tokenize({
                    flow: 'checkout', // Required
                    locale: 'en_US',
                    displayName: 'MomentCam',
                    amount: PayOrder.PayDataResult.PayAmount, // Required
                    currency: PayOrder.PayDataResult.CurrencyIsoCode // Required
                }, PayOrder.SendNonceToServer);
            });
            PayOrder.SuccessCallback();
        });
    },
    Bind: function (isPaypal) {
        $.post({
            url: App.Urls.CreateBraintreeUrl,
            data: {
                Token: PayOrder.Token,
                Payable: PayOrder.Payable,
                PayType: PayOrder.PayType,
                OrderInfo: PayOrder.OrderInfo,
                CurrencyUnit: PayOrder.CurrencyUnit
            },
            success: function (result) {
                if (result.StatusCode == 0) {
                    PayOrder.PayDataResult = result;
                    PayOrder.PayNumber = result.PayNumber

                    braintree.client.create({
                        authorization: result.BrainTreeToken
                    }, function (err, clientInstance) {
                        if (err) {
                            PayOrder.ErrorCallback({ StatusCode: 1, Description: err.message });
                            return;
                        }
                        if (isPaypal) {
                            PayOrder.CreatePaypal(clientInstance);
                        } else {
                            PayOrder.CreateCredit(clientInstance);
                        }
                    });
                } else {
                    PayOrder.ErrorCallback(result);
                }
            },
            error: function (msg) {
                PayOrder.ErrorCallback({ StatusCode: 1, Description: "network error" });
            }
        });
    },
    SendNonceToServer: function (err, payload) {
        if (err) {
            PayOrder.ErrorCallback({ StatusCode: 1, Description: err.message });
            return;
        }
        $.post({
            url: App.Urls.BraintreePayBackUrl,
            data: {
                Nonce: payload.nonce,
                PayNumber: PayOrder.PayNumber
            },
            success: function (result) {
                if (result.StatusCode == 0) {
                    PayOrder.JumpToReturnUrl();
                } else {
                    PayOrder.ErrorCallback(result);
                }
            },
            error: function (msg) {
                PayOrder.ErrorCallback({ StatusCode: 1, Description: "network error" });
            }
        });
    },
    PrepareCreditPay: function (submitButtonId, successCallback, errorCallback) {
        PayOrder.SuccessCallback = successCallback;
        PayOrder.ErrorCallback = errorCallback;
        PayOrder.SubmitButtonId = submitButtonId;
        $(".hosted-field").html("");
        PayOrder.Bind(false);
    },
    PreparePaypalPay: function (submitButtonId, successCallback, errorCallback) {
        PayOrder.SuccessCallback = successCallback;
        PayOrder.ErrorCallback = errorCallback;
        PayOrder.SubmitButtonId = submitButtonId;
        PayOrder.Bind(true);
    },
};


