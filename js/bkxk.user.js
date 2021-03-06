// ==UserScript==
// @name         BKXK AUTO LOGIN
// @namespace    http://tampermonkey.net/
// @version      0.0.4
// @updateURL    https://onns.xyz/js/bkxk.user.js
// @description  none
// @author       Onns
// @match        *://bkxk.xmu.edu.cn/xsxk/*
// @grant        none
// @run-at       document-end
// @require      https://onns.xyz/js/gm_config.js
// ==/UserScript==

/* 更新日志
0.0.4 提示更新 0.5h
0.0.3 修复密码错误无限刷新 0.5h
0.0.2 选课轮次题型，若干bug修复 2h
0.0.1 自动登录，自动抢课 6h
*/
/* TODO List
选课轮次尚需手动输入，未来可以改为自动修改。
*/
(function () {
    'use strict';

    function form_submit() {
        var userName = document.getElementById("username").value;
        if (userName == "" || userName == null) {
            alert("请输入用户名！");
            document.getElementById("username").focus();
            return false;
        }

        var strPass = document.getElementById("password").value;
        if (strPass == "" || strPass == null) {
            alert("请输入登录密码！");
            document.getElementById("password").focus();
            return false;
        }

        document.getElementById("loginForm").submit();
    }

    function selectCourse(xxlx, xklc) {
        var course_number = document.getElementById('view_table').getElementsByTagName("tr").length;
        console.log(course_number);
        for (var i = 1; i < course_number; i++) {
            var jxbid = document.getElementById('view_table').getElementsByTagName("tr")[i].getElementsByTagName("a")[0].id;
            console.log(jxbid);
            document.getElementById('view_table').getElementsByTagName("tr")[i].children[11].innerHTML = '<a href="http://bkxk.xmu.edu.cn/xsxk/elect.html?method=handleZxxk&jxbid=' + jxbid + '&xxlx=' + xxlx + '&xklc=' + xklc + '" style="font-size:12px;font-weight:bold;color:blue" target="_blank">抢课</a>';
        }
    }

    var setting = document.createElement('div');
    var timer = null;
    setting.innerHTML = '设置';
    setting.style.cssText = 'position: absolute;right: 30px; top: 30px; color:#000000;';
    setting.onclick = function () {
        clearTimeout(timer);
        GM_config.open();
    }

    if (window.location.href.indexOf("index.html") > -1 || window.location.href.indexOf("logout.html") > -1 || window.location.href.indexOf("login.html") > -1) {
        if(typeof xklcList != 'undefined') {
            setting.innerHTML += '<br/>选课轮次:';
            for (var key in xklcList) {
                setting.innerHTML += key + ', ';
            }
        }
        document.body.appendChild(setting);
    }

    GM_config.init({
        'id': 'MyConfig',
        'title': '个人信息设置',
        'fields':
        {
            'XMUID': {
                'label': '学号',
                'type': 'text',
                'default': ''
            },
            'XMUPASSWORD': {
                'label': '密码',
                'type': 'text',
                'default': ''
            },
            'xklc': {
                'label': '选课轮次(7位数字，依次尝试)',
                'type': 'text',
                'default': ''
            }
        },
        'events': {
            //         'init': function() { alert('onInit()'); },
            // 'open': function() { alert('onOpen()'); },
            // 'save': function() { alert('onSave()'); },
            // 'close': function() { alert('onClose()'); },
            // 'reset': function() { alert('onReset()'); }
            'close': function () {
                location.reload();
            },
            'save': function () {
                location.reload();
            }
        },
        'css': ""
    });

    // 全局定义
    var XMUID = GM_config.get('XMUID');
    var XMUPASSWORD = GM_config.get('XMUPASSWORD');
    var xklc = GM_config.get('xklc');
    var refresh = 1;

    if (XMUID == '' || XMUPASSWORD == '') {
        GM_config.open();
    } else {
        var xxlx = 0;

        if (window.location.href.indexOf("elect.html") > -1) {
            if (document.body.innerText.indexOf('当班级选课人数已满，请选择本课程其它班级！') > -1) {
                console.log('refresh');
                setTimeout(function () { window.location.reload(); }, 1000);
            }
            if (document.body.innerText.indexOf('true') > -1) {
                refresh = 0;
                alert('Success!');
            }
            if (document.body.innerText.indexOf('本学期已选过相同的课程，不可重复选择！') > -1) {
                refresh = 0;
                alert('Success!');
            }
            if (document.body.innerText.indexOf('轮次ID不合法！') > -1) {
                alert('请查看首页推荐轮次ID，修改尝试');
                window.location.href = 'http://bkxk.xmu.edu.cn/xsxk/index.html';
            }
        } else if (window.location.href.indexOf("yxbxk.html") > -1) {
            xxlx = 2;
            selectCourse(xxlx, xklc);
        } else if (window.location.href.indexOf("qxxbxk.html") > -1) {
            xxlx = 1;
            selectCourse(xxlx, xklc);
        } else if (window.location.href.indexOf("yxxx.html") > -1) {
            xxlx = 4;
            selectCourse(xxlx, xklc);
        } else if (window.location.href.indexOf("qxxxx.html") > -1) {
            xxlx = 3;
            selectCourse(xxlx, xklc);
        } else if (window.location.href.indexOf("ggk.html") > -1) {
            xxlx = 5;
            selectCourse(xxlx, xklc);
        } else {
            if (window.location.href.indexOf("index.html") > -1 && document.getElementById('logout') == null) {
                window.location.href = 'http://bkxk.xmu.edu.cn';
            }
            if (window.location.href.indexOf("index.html") == -1) {
                if (document.getElementsByClassName('redirect-span').length != 0) {
                    window.location.href = 'http://bkxk.xmu.edu.cn/xsxk/localInfo.html';
                }
                document.getElementById("username").value = XMUID;
                document.getElementById("password").value = XMUPASSWORD;
                if(document.getElementById("loginForm").innerText.indexOf("用户名或密码错误！") > -1) {
                    alert('用户名或密码错误！');
                } else {
                    form_submit();
                }
            }
        }

        if(refresh) {
            setTimeout(function () { window.location.reload(); }, 1000 * 60 * 5);
            console.log('refresh main page.');
        }
    }
})();