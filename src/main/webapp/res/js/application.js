//seajs�������������ļ��������֮��ִ���������ĺ���
define(function (require, express, moudle) {
    //�����js������ɵ�ʱ��seajs���첽�������js������������js������require���ļ���
    //���ڼ������첽�ģ����Կ���jquery�Ĳ����jquery�ȼ����꣬����ɱ���
    //�����������jquery�������Ϊ����CMD�淶,��jquery���������jquery
    //�ο���ַ��https://github.com/seajs/seajs/issues/971

    //require��������������ģ�飨js���ķ���
    //ʹ�÷���require("����|·��")
    //����·���淶�ο���https://github.com/seajs/seajs/issues/258
    //����CMD�淶��js�ļ�require��᷵��һ������
    //�����Ϲ淶�İ汾�᷵��null,���jquery�汾��֧��CMD�淶�����������ǻ�����ִ�У�
    //jquery == null
    //�Ѿ�����ʹ��jquery��ȫ�ֱ�����
//	console.log($("body").size());
    //�������� Ĭ��֧��CMD�淶 ���Կ���ֱ�ӻ�ö���
//	var layer = require("layer/layer/layer.min");
    //����һ��
    // layer.alert('������ڻ�ӭ��',9); //���һ

    //��֤���
//	require("validation/css/validationEngine.jquery.css");
//	require("validation/js/jquery.validationEngine");
//	require("validation/js/jquery.validationEngine-zh_CN");

    String.prototype.len = function () {
        var cArr = this.match(/[^\x00-\xff]/ig);
        return this.length + (cArr == null ? 0 : cArr.length);
    }

    /**
     * ����Դ�������֮�󣬳�ʼ����װ����
     */
    express.init = function () {
        /** jquery��� ************************************/
        /**
         * ajax�ύ��֤��
         * @param success = �ύ��ϻص��¼�function(״̬true:û�д���false:�д���form, json:��̨���ص�����, option)
         * @param optionsTemp = �ɿգ�����
         */
        $.fn.ajaxForm = function (success, optionsTemp) {
            var options = {
                promptPosition: "centerRight:3,1",
                addPromptClass: 'formError-white',
                ajaxFormValidation: true,
                maxErrorsPerField: 1,
                onAjaxFormComplete: success,
                //ֻ���ύ��ʱ����Ϊ�յ���������ǿ��ԭ�е����ԣ�
                onlySubmitValidRequired: true,
                ajaxFormValidationMethod: $(this).attr("method") || 'get',
                scroll: false
            }
            var valid = this.validationEngine($.extend(options, optionsTemp));
        };

        /**
         * ������֤�� ������֧�����루#outPassword����ʱ����Զ����֧�������Ƿ�����
         * @param url = ������֧������ĵ�ַ������ʹStringҲ�����Ƿ���String��function
         */
        $.fn.sendCode = function (url, dataTemp) {
            var waitSec = 120;//�ȴ�ʱ��
            var _this = this;
            this.click(function () {
                if ($(this).hasClass("disable")) {
                    return;
                }
                ajaxUrl = (typeof(url) == 'function') ? url() : url
                if (ajaxUrl === false) {
                    return;
                }
                if ($(this).parents("form").find('#outPassword').size() && ($('#outPassword').validationEngine('validate') || !$('#outPassword').val())) {
                    layer.alert("�����뽻�������ٷ�����֤��", 2)
                    return;
                }
                var sendNode = $(this);
                var data = $(this).hasClass("sendVoice") ? {voice: true} : {};
                var temp = (typeof(dataTemp) == 'function') ? dataTemp() : dataTemp;
                if (temp === false) {
                    return;
                }
                data = $.extend(data, temp);
                $.ajax({
                    url: ajaxUrl,
                    loading: true,
                    data: data,
                    loadingText: '��֤�뷢����',
                    dataType: 'json',
                    type: 'POST',
                    error: function (data, transport) {
                        if (data.responseJSON) {
                            this.success(data.responseJSON)
                        } else {
                            this.success(data)
                        }
                    },
                    success: validMethods.createAjaxCallback(function (status) {
                        if (status) {
                            if (sendNode.hasClass("sendVoice")) {
                                layer.tips("��ע������Ժ�������绰", sendNode, {guide: 0, time: 4})
                            }
                            _this.addClass("disable").css({"background-color": "#535553", "color": "white"});
                            countdown(waitSec, function (sec) {
                                if (sendNode.get(0).nodeName == 'INPUT') {
                                    sendNode.val(sec + "�����ط�");
                                } else {
                                    sendNode.text(sec + "�����ط�");
                                }
                                if (!sec) {
                                    _this.removeClass("disable").removeAttr("style");
                                    sendNode[sendNode.get(0).nodeName == 'INPUT' ? 'val' : 'text'](sendNode.hasClass("sendVoice") ? "������֤��" : "������֤��");
                                }
                            });
                        }
                    }, sendNode.parents("form"))
                });
            });
        }

        /**
         * ����ajax���󣬿��Խ�����̨���صĴ�����Ϣ
         * @param url = �����ַ
         * @param callback = �ص�����function(status, data)status��boolean�ͣ�����ɹ���ʧ�ܣ�data����̨���ص�����
         * @param tempOptions = jquery ajax�����ò������ɿ�
         */
        $.ajaxValid = function (url, callback, tempOptions) {
            var fun = validMethods.createAjaxCallback(callback);
            var options = {
                url: (typeof(url) == 'function') ? url() : url,
                loading: true,
                dataType: 'json',
                success: fun,
                error: fun
            }
            $.ajax($.extend(options, tempOptions));
        }

        if (window.layer) {
            /**
             * ������
             * @param tit = ��ʾ����
             * @param ico = ͼ����ʽ 1.��ȷ 2.���� 3.���� 4.ѯ��
             * @param callback = �ص����� function(true:�����ȷ���� false:�����ȡ����رհ�ť)
             * @param isShowCancel = �Ƿ���ʾȡ����ť
             * @param options = ��������{ok: 'ȷ����ť����', cancel: 'ȡ����ť����', align: '���ֶ��䷽ʽcenter', showIco:'�Ƿ���Ҫͼ��true'}
             */
            layer.hAlert = function (tit, ico, callback, isShowCancel, options) {
                layer.confirm(tit, {icon: ico}, callback);
                /*
                 options = $.extend({ok:'ȷ&nbsp;&nbsp;&nbsp;&nbsp;��', cancel:'ȡ&nbsp;&nbsp;&nbsp;&nbsp;��', align: 'center', showIco: true}, options);
                 var width = tit.length * 17 + 150;
                 width = width > 600 ? 600 : width;
                 if(isShowCancel){width = width < 320 ? 320 : width;}
                 ico = ico ? ico : 1;
                 var cancelHtml = isShowCancel ? '<a class="hxb-cancel transition" href="javascript:void(0)">' + options.cancel +'</a>' : '';
                 var icoHtml = options.showIco ? '<td><div class="bkImg bkImg-' + ico + '"></div></td>' : '';
                 //�Զ��嵯����
                 layer.open({
                 type: 1,
                 title: false,
                 //closeBtn: false,
                 area: ['auto', 'auto'],
                 content: '<div class="hxbAlert"  style="width:' + width + 'px"><div class="hxbtitlediv"><span class="tit">��ʾ</span><span class="close-zz transition"><a class="hxb-close transition" href="javascript:void(0)">��</a></span></div><div class="context"><table><tr>' + icoHtml + '<td><p style="text-align: ' + options.align + ';">'+ tit +'</p></td></tr></table><div class="hxbBtns"><a href="javascript:void(0)" class="hxb-ok transition">' + options.ok + '</a>' + cancelHtml + '</div></div></div>',
                 yes:function(layero){
                 var index = layero.attr("times");
                 $(".hxb-ok").focus();
                 layero.find(".hxb-close,.hxb-ok,.hxb-cancel").click(function(){
                 if(callback){
                 if(callback($(this).hasClass('hxb-ok')) === false){
                 return;
                 }
                 }
                 layer.close(index);
                 });
                 }

                 });
                 */
            }

            /**
             * �رյ����򣬽��޵���div��
             * @param node = �������ڵ�һ��jqueryԪ��
             */
            layer.closeWin = function (node) {
                layer.close(node.parents(".xubox_layer").attr("times"));
            }

            /**
             * ѯ�ʿ�
             * @param tit = ��ʾ����
             * @param callback = function(true:�����ȷ����false:�����ȡ��)
             */
            layer.hConfirm = function (tit, callback, options) {
                layer.hAlert(tit, 3, callback, true, options);
            }

            /**
             * �ڵ������м���һ��url����
             * @param url = Ҫ��ʾ���ݵĵ�ַ
             * @param tit = ������ʾ
             */
            layer.alertUrl = function (url, tit, options) {
                var optionsTemp = {
                    type: 2,
                    title: tit,
                    content: [url, 'no'],
                    area: ['500px', '300px']
                };

                $.extend(optionsTemp, options);
                layer.open(optionsTemp);
            }
        }
    }


    // ajaxȫ������
    $.ajaxSetup({
        beforeSend: function () {
            //��⵽loading������ʹ������
            if (this.loading) {
                this.loadingIndex = layer.load(this.loadingText, 0);
            }
        },
        complete: function () {
            //�����������ر�����
            if (this.loadingIndex) {
                try {
                    layer.close(this.loadingIndex);
                } catch (e) {

                }
            }
        },
        cache: false
    });

    /**
     * @param overcall ����ʱ�����¼�
     * @param stepcall ÿ��ִ���¼�
     * @param style �������ʽ��d��hСm����s��
     */
    $.fn.countdown = function (attrs) {
        var sum;
        var overCall = attrs.overCall;
        var stepCall = attrs.stepCall;
        var style = attrs.style ? attrs.style : "DHMS";
        var _this = $(this);
        if (_this.attr("data-time")) {
            sum = parseInt(_this.attr("data-time"))
        } else {
            var starDate = new Date(_this.attr("data-start"));
            var endDate = new Date($(_this.attr("data-end")));
            sum = endDate.getTime() - starDate.getTime();
        }
        _this.attr("data-time", sum);
        refresh()
        var timersInter = setInterval(function () {
            refresh()
        }, 1000);

        function refresh() {
            sum = parseInt(_this.attr("data-time"));
            sum -= 1000;
            if (sum < 0) {
                overCall ? overCall(_this) : _this.text("");
                clearInterval(timersInter);
                return;
            }
            if (stepCall) {
                stepCall(_this, getZeroX(sum))
            } else {
                _this.text(toText(getX(sum)))
            }
            _this.attr("data-time", sum)
        }

        function getX(sum) {
            switch (style) {
                case "HMS":
                    return {
                        hours: parseInt((sum / 3600000)),
                        minutes: parseInt(((sum % 86400000) % 3600000) / 60000),
                        seconds: parseInt((((sum % 86400000) % 3600000) % 60000) / 1000)
                    }
                    break;
                case "MS":
                    return {
                        minutes: parseInt(sum / 60000),
                        seconds: parseInt((((sum % 86400000) % 3600000) % 60000) / 1000)
                    }
                    break;
                case "S":
                    return {
                        seconds: parseInt(sum / 1000)
                    }
                    break;
                case "DHMS":
                default :
                    return {
                        day: parseInt(sum / 86400000),
                        hours: parseInt((sum % 86400000) / 3600000),
                        minutes: parseInt(((sum % 86400000) % 3600000) / 60000),
                        seconds: parseInt((((sum % 86400000) % 3600000) % 60000) / 1000)
                    }
                    break;
            }

        }

        function getZeroX(sum) {
            var timeArray = getX(sum)
            for (var item in timeArray) {
                if (timeArray[item] < 10) {
                    timeArray[item] = '0' + timeArray[item]
                }
            }
            return timeArray;
        }
    }
//����ʱ�޸Ŀ�ʼ
    var map = {day: '��', hours: 'ʱ', minutes: '��', seconds: '��'}
    $(".timer").each(function () {
        var sum;
        if ($(this).attr("sum")) {
            sum = parseInt($(this).attr("sum"))
        } else {
            var starDate = new Date($(this).attr("date"))
            var endDate = new Date($(this).attr("endDate"))
            sum = endDate.getTime() - starDate.getTime()
        }
        $(this).attr("sum", sum)
        changeTimeShow()
    })
    setInterval(function () {
        changeTimeShow()
    }, 1000)

    function changeTimeShow() {
        $(".timer").each(function () {
            var sum = parseInt($(this).attr("sum"))
            sum -= 1000;
            if (sum < 0) {
                $(this).removeClass('timer').text("");
                return;
            }
            $(this).text(toText(getX(sum)))
                .attr("sum", sum)
        })
    }

    function toText(datex) {
        var text = "";
        //$('.timer').css('color','#F90');
        for (var item in datex) {
            if (datex[item] != 0 || item == 'seconds' || item == 'minutes') {
                if (datex[item] < 10) {
                    text += '0' + datex[item] + map[item]
                }
                else {
                    text += datex[item] + map[item]
                }
            }
        }
        return text
    }

    var daySum = 24 / 60 / 60 / 1000;

    function getX(sum) {
        return {
            day: parseInt(sum / 86400000),
            hours: parseInt((sum % 86400000) / 3600000),
            minutes: parseInt(((sum % 86400000) % 3600000) / 60000),
            seconds: parseInt((((sum % 86400000) % 3600000) % 60000) / 1000)
        }
    }

//����ʱ�޸Ľ���


    /**
     * ����ʱ����
     * @param secs = �ܵ���ʱʱ�䣨��λ�룩
     * @param callback = ÿ��ص��ĺ���function(��ǰ��������������)
     */
    window.countdown = function countdown(secs, callback) {
        var countSecs = secs;
        var recursive = function () {
            callback(secs, countSecs);
            if (secs == 0) {
                return;
            }
            secs--;
            setTimeout(recursive, 1000);
        }
        recursive();
    }

    // ҳ����������Ҫ���еĲ���
    $(function () {
        // ��֤��ͼƬ��ʾ�������¼�
        $("#captcha-img").click(function () {
            $(this).attr("src", window.hxb.ctx + "router/common/captcha?v=" + Math.random() + "&w=" + $(this).attr("width") + "&h=" + $(this).attr("height"));
        }).click();

        // ������Ϊsubmit��Ԫ�ص����¼�Ϊ�������ύ�¼�
        $(document).on("click", ".submit", function () {
            $(this).parents("form").submit();
        });

        // �����س��ύ
        $(document).on("keyup", ".input-submit input", function (even) {
            if ($(this).parents("form").size()) {
                if (even.keyCode == 13) {
                    $(this).blur().parents("form").submit();
                }
            }
        });

        /**
         * ��ajaxAlert���Ԫ�����õ����¼�Ϊ����ajax���س����ĶԻ���
         */
        $(".ajaxAlert").click(function () {
            layer.alertUrl($(this).attr("href"), $(this).attr("title"));
            return false;
        });

        /**
         * classΪhxb-tip��Ԫ�������¼�Ϊ������ʾ��
         */
        $("[data-tip]").mouseover(function () {
            var tipId = layer.tips($(this).data("tip"), $(this), {tips: [1, '#f90']});
            $('#layui-layer' + tipId).css('margin-left', '-16px')
            $(this).data("tipId", tipId)
        });

        $(".focus").focus()

        /**
         * ����Ҫ��a�������ӹ���Ч��
         */
        $(".transition").addClass("transition5").each(function () {
            $(this).find("a").addClass("transition5");
        });

        /**
         * tabҳ�л�
         */
        $("[data-tab-head]").each(function () {
            var data = $(this).data();
            data.tabEvent = data.tabEvent ? data.tabEvent : "mousemove";
            $(data.tabHead).data(data).on(data.tabEvent, function () {
                var index = $(data.tabHead).removeClass(data.tabSelect).index(this);
                $(this).addClass(data.tabSelect);
                $(data.tabShow).hide().eq(index).show();
            });
        });
    });
});