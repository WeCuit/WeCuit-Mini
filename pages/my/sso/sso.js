// pages/my/sso/sso.js

const XMLParser = require("../../../utils/xmldom/dom-parser");
const xmlParser = new XMLParser.DOMParser();
import {
    captchaOCR,
    getSSOCaptcha,
    checkSSOLogin,
    jwglLogin,
    ssoLogout,
    WV_login,
    WV_loginAuth,
    jwglLoginCheck,
    WV_loginCheck
} from '../api'
// var L = new login.DoLogin();

// rsa 加密
const RSA = require("../../../utils/rsa/wx_rsa.js");
const encrypt = new RSA.RSAKey();

const app = getApp();
var _this;

Page({
    /**
     * 页面的初始数据
     */
    data: {
        userId: "",
        userPass: "",
        isRemPass: false,
        captchaImg: "",
        captchaCode: "",
        isNeedLogin: true,
        SSO_SESSION: "",
        execution: "",
        isNeedCaptcha: 0,
        isAutoLogin: false,
        accountInfo: {},
        sessionInfo: {},
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        _this = this;
        this.initUserData();
    },

    // 根据storage存储初始化用户数据
    initUserData: function () {
        let temp = {};
        temp.userId = app.globalData.accountInfo.userId;
        temp.userPass = app.globalData.accountInfo.userPass;
        temp.vpnPass = app.globalData.accountInfo.vpnPass
            ? app.globalData.accountInfo.vpnPass
            : "";
        temp.isRemPass = app.globalData.accountInfo.isRemPass;
        temp.isAutoLogin = app.globalData.accountInfo.isAutoLogin;
        this.setData(temp);
        this.data.sessionInfo = app.globalData.sessionInfo;
        this.data.accountInfo = app.globalData.accountInfo;
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.checkSsoLogin((SESSION) => {
            this.getCaptcha(SESSION);
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        // console.log(app.globalData.sessionInfo)
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () { },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () { },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () { },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () { },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () { },

    /**
     * 表单提交
     * 
     * @param {*} e
     */
    formSubmit: function (e) {
        // console.log(e.detail.value);
        let formData = e.detail.value;
        // 数据赋值
        this.data.userId = this.data.accountInfo.userId = formData.userId;
        this.data.userPass = this.data.accountInfo.userPass = formData.userPass;
        this.data.vpnPass = this.data.accountInfo.vpnPass = formData.vpnPass;
        this.data.isRemPass = this.data.accountInfo.isRemPass =
            formData.isRemPass;
        this.data.isAutoLogin = this.data.accountInfo.isAutoLogin =
            formData.isAutoLogin;

        // 记住密码
        if (this.data.isRemPass) {
            wx.setStorage({
                key: "accountInfo",
                data: this.data.accountInfo,
            });
        }
        var sso_data = {
            SSO_SESSION: this.data.SSO_SESSION,
            execution: this.data.execution,
            userId: formData.userId,
            userPass: formData.userPass,
            captcha: formData.captcha,
        };
        app.loginClass.ssoDoLogin(sso_data)
            .then((cookies) => {
                console.log("success");
                var tgc = cookies.match(/TGC=(.*?);/);
                this.data.sessionInfo.SSO_TGC = tgc[1];

                this.setData({
                    isNeedLogin: false,
                });
                wx.showToast({
                    title: "SSO登录成功",
                });
                app.globalData.isUser = true;
                wx.setStorage({
                    data: true,
                    key: "isUser",
                });
                wx.setStorage({
                    data: tgc[1],
                    key: "SSO_TGC",
                });

                this.loginFunc
                    .WEBVPN_isAdmin()
                    .then(() => {
                        console.log("check & login");
                        this.loginCheckFunc.WEBVPN();
                        this.loginFunc.JWGL();
                    })
                    .catch(() => {
                        this.loginFunc.WEBVPN(() => {
                            this.loginFunc.JWGL();
                        });
                    });
            })
            .catch((err) => {
                if ("string" == typeof err.Msg) {
                    wx.showToast({
                        icon: 'none',
                        title: err.errMsg
                    })
                }
                this.checkSsoLogin((SESSION) => {
                    this.getCaptcha(SESSION);
                });
            });
    },

    /**
     * 检查登录状态
     * @param {SSO_SESSION} r
     *
     */
    checkSsoLogin: function (r) {
        checkSSOLogin("SESSION=" +
            this.data.SSO_SESSION +
            "; TGC=" +
            this.data.sessionInfo.SSO_TGC)
            .then((res) => {
                var ret = {};
                if (
                    res.data &&
                    res.data.indexOf("已经成功登统一认证中心") != -1
                ) {
                    ret["status"] = 2000;
                } else if (
                    res.data.indexOf("成都信息工程大学统一身份") != -1
                ) {
                    // 登录webvpn，未登录统一认证中心
                    ret["status"] = 2002;
                    ret["SESSION"] = null;
                    var cookie = "";
                    if ("undefined" != typeof res.header["set-cookie"])
                        cookie = res.header["set-cookie"];
                    else if ("undefined" != typeof res.header["Set-Cookie"])
                        cookie = res.header["Set-Cookie"];
                    if (-1 != cookie.indexOf("SESSION")) {
                        // SESSION需要更新
                        ret["SESSION"] = cookie.match(/SESSION=(.*);/)[1];
                    }
                    ret["execution"] = null;
                    if (res.data.indexOf("execution") != -1) {
                        ret["execution"] = res.data.match(
                            /" name="execution" value="(.*?)" \/>/
                        )[1];
                    }
                } else {
                    // 两个站点都未登录
                    reject(-1);
                }
                if (ret.execution) {
                    this.data.execution = ret.execution;
                }
                if (ret.status == 2000) {
                    this.setData({
                        isNeedLogin: false,
                    });
                    // 检查其它登录点
                    this.loginFunc.WEBVPN_isAdmin().then(() => {
                        this.loginCheckFunc.WEBVPN();
                        this.loginCheckFunc.JWGL();
                    }).catch(() => {
                        this.loginCheckFunc.WEBVPN();
                        this.loginCheckFunc.JWGL();
                    });
                    return;
                } else {
                    if (ret.SESSION != null) {
                        this.data.SSO_SESSION = ret.SESSION;
                    }
                    r(this.data.SSO_SESSION);
                }
            })
            .catch((err) => {
                if (err == -1) {
                    // 无SESSION cookie 为登录webvpn
                } else {
                    console.log(err);
                }
            });
    },

    /**
     * 获取验证码
     * @param {*} r
     */
    getCaptcha: function (SESSION) {
        getSSOCaptcha("SESSION=" + SESSION)
            .then((res) => {
                const captcha = res.data;
                var imgBase64 =
                    "data:image/png;base64," + wx.arrayBufferToBase64(captcha);
                this.setData({
                    captchaImg: imgBase64,
                });
                this.captchaDecode(captcha, (code) => {
                    this.setData({
                        captchaCode: code,
                    });
                });
            })
            .catch((err) => {
                console.log("error", err)
            });
    },

    // ORC识别验证码
    captchaDecode: function (pic, r) {
        try {
            const byteArray = new Uint8Array(pic);
            const hexParts = [];
            let start = parseInt(byteArray.length / 3);
            let end = parseInt(byteArray.length / 2);
            while (end - start > 20) end = parseInt((start + end) / 2);

            for (let i = start; i < end; i++) {
                // convert value to hexadecimal
                const hex = byteArray[i].toString(16);
                // pad with zeros to length 2
                const paddedHex = ("00" + hex).slice(-2);
                // push to array
                hexParts.push(paddedHex);
            }
            // join all the hex values of the elements into a single string
            let h = hexParts.join("");
            var verify = h + "/@jysafe.cn";
            captchaOCR(app.RSAEncrypt(verify), pic).then(res => {
                console.log(res)
                if (200 == res.data.code) r(res.data.data.result);
                else {
                    wx.showToast({
                        icon: "none",
                        title: res.data.msg,
                    });
                }
                return;
            }).catch(err => {
                wx.showToast({
                    icon: "none",
                    title: "验证码识别失败",
                });
            })
        } catch (err) {
            console.log(err);
        }
    },

    /**
     * 注销按钮事件
     */
    bindButtonLogout: function (e) {
        this.setData({
            userId: this.data.userId,
            userPass: this.data.userPass,
            vpnPass: this.data.vpnPass,
            isWebVpnLogin: false,
        });
        ssoLogout("SESSION=" + this.data.SSO_SESSION).then(() => {
            this.setData({
                isNeedLogin: true,
            });
            this.data.sessionInfo.SSO_TGC = "";
            this.data.SSO_SESSION = "";
            this.data.sessionInfo.JWGL_cookie = "";
            this.data.sessionInfo.JSZX_cookie = "";
            wx.removeStorage({
                key: "SSO_SESSION",
            });
            wx.removeStorage({
                key: "SSO_TGC",
            });
            wx.removeStorage({
                key: "JWGL_cookie",
            });
            wx.removeStorage({
                key: "JSZX_cookie",
            });
            wx.removeStorage({
                key: "TWFID",
            });
            this.checkSsoLogin((SESSION) => {
                this.getCaptcha(SESSION);
            });
        });
    },
    bindButtonBack: function () {
        wx.navigateBack({
            delta: 1,
        });
    },
    // 刷新验证码
    refreshCaptcha: function () {
        this.getCaptcha(this.data.SSO_SESSION);
    },

    loginAction: function (e) {
        console.log(e);
        this.loginFunc[e.currentTarget.dataset.type]();
    },

    // 登录函数
    loginFunc: {
        // 教务管理系统登录
        JWGL: function () {
            const cookie = `TGC=${app.globalData.sessionInfo.SSO_TGC}; TWFID=${app.globalData.sessionInfo.TWFID}`
            jwglLogin(cookie).then((res) => {
                const resp = res.data;
                _this.data.sessionInfo.JWGL_cookie = resp.data;
                wx.setStorage({
                    key: "JWGL_cookie",
                    data: resp.data,
                });
                _this.setData({
                    isJwglLogin: true,
                });
                wx.showToast({
                    title: "教务处登录成功",
                });
            });
        },

        // WebVpn登录
        WEBVPN_isAdmin: function () {
            return new Promise((resolve, reject) => {
                // 普通用户
                if (true !== app.globalData.accountInfo.isAdmin) reject();
                else
                    // 管理员
                    app.login().then((code) => {
                        wx.request({
                            url: app.globalData.API_DOMAIN + "/Sys/getAdminTWFID",
                            data: { code: code },
                            success: (res) => {
                                if (2000 === res.data.status) {
                                    app.globalData.sessionInfo.TWFID =
                                        res.data.twfid;
                                    wx.setStorage({
                                        data: res.data.twfid,
                                        key: "TWFID",
                                    });
                                }
                                resolve();
                            },
                            fail: (err) => {
                                console.error("失败", err);
                                wx.showToast({
                                    icon: "none",
                                    title: "网络异常",
                                });
                                reject();
                            },
                        });
                    });
            });
        },
        WEBVPNV2: function () {
            this.WEBVPN_isAdmin()
                .then(() => {
                    this.WEBVPN();
                    this.JWGL();
                })
                .catch(() => {
                    this.WEBVPN(() => {
                        this.JWGL();
                    });
                });
        },
        WEBVPN: (r) => {
            new Promise((resolve, reject) => {
                _this.loginFunc.loginAuth((auth) => {
                    WV_login("language=zh_CN; privacy=1; ENABLE_RANDCODE=" +
                        _this.data.isNeedCaptcha +
                        "; TWFID=" +
                        auth.TwfID, {
                        mitm_result: "",
                        svpn_req_randcode: auth.rc,
                        svpn_name: _this.data.userId,
                        svpn_password: auth.encrypted_pwd,
                        svpn_rand_code: "",
                    }).then(res => {
                        var ret = {};
                        var doc = xmlParser.parseFromString(res.data);
                        var msg = doc.getElementsByTagName("Message")[0]
                            .firstChild.data;
                        var cookie = "";
                        if ("undefined" != typeof res.header["set-cookie"])
                            cookie = res.header["set-cookie"];
                        else if (
                            "undefined" != typeof res.header["Set-Cookie"]
                        )
                            cookie = res.header["Set-Cookie"];
                        if (msg == "radius auth succ") {
                            ret["status"] = 200;
                            var TWFID = doc.getElementsByTagName("TwfID")[0]
                                .firstChild.data;
                            resolve(TWFID);
                        } else {
                            ret["doc"] = doc;
                            if (-1 != cookie.indexOf("ENABLE_RANDCODE=1"))
                                ret["needCaptcha"] = true;
                            reject(ret);
                        }
                    })
                });
            })
                .then((TWFID) => {
                    // 更新TWFID
                    if (TWFID != app.globalData.sessionInfo.TWFID) {
                        app.globalData.sessionInfo.TWFID = TWFID;
                        wx.setStorage({
                            data: TWFID,
                            key: "TWFID",
                        });
                    }
                    _this.setData({
                        isWebVpnLogin: true,
                    });
                    wx.showToast({
                        title: "WebVpn登录成功",
                    });
                    app.globalData.sessionInfo.TWFID = TWFID;
                    r();
                })
                .catch((err) => {
                    console.log(err);
                    var doc = err.doc;
                    var code = doc.getElementsByTagName("ErrorCode")[0]
                        .firstChild.data;
                    if (code == 20021) {
                        wx.showToast({
                            title: "已是登录状态",
                        });
                        _this.setData({
                            isWebVpnLogin: true,
                            isNeedLogin: false,
                        });
                    } else if (code == 20004) {
                        wx.showToast({
                            icon: "none",
                            title: "账号信息错误",
                        });
                        if (err.needCaptcha) {
                            // _this.getCaptcha();
                        }
                    } else if (code == 20041) {
                        wx.showToast({
                            icon: "none",
                            title: "错误次数过多",
                        });
                        // _this.getCaptcha();
                    } else if (code == 20023) {
                        wx.showToast({
                            icon: "none",
                            title: "验证码错误",
                        });
                        // _this.getCaptcha();
                    } else if (code == 20026) {
                        wx.showToast({
                            icon: "none",
                            title: "webvpn:未登录或已超时",
                        });
                        app.globalData.sessionInfo.TWFID = "";
                        // _this.getCaptcha();
                    } else {
                        wx.showToast({
                            icon: "none",
                            title: "未知异常",
                        });
                    }
                });
        },

        loginAuth: function (r) {
            WV_loginAuth("language=zh_CN; privacy=1; ENABLE_RANDCODE=" +
                _this.data.isNeedCaptcha +
                ";TWFID=" +
                app.globalData.sessionInfo.TWFID)
                // new login.DoLogin().webVpnAuth(_this.data.isNeedCaptcha, app.globalData.sessionInfo.TWFID)
                .then((res) => {
                    var doc = xmlParser.parseFromString(res.data);
                    var randCode = doc.getElementsByTagName(
                        "CSRF_RAND_CODE"
                    )[0].firstChild.data;
                    var msg = doc.getElementsByTagName("Message")[0]
                        .firstChild.data;
                    var TwfID = doc.getElementsByTagName("TwfID")[0]
                        .firstChild.data;
                    var RSA_ENCRYPT_KEY = doc.getElementsByTagName(
                        "RSA_ENCRYPT_KEY"
                    )[0].firstChild.data;
                    var RSA_ENCRYPT_EXP = doc.getElementsByTagName(
                        "RSA_ENCRYPT_EXP"
                    )[0].firstChild.data;
                    let auth;
                    if (msg == "login auth success") {
                        auth = {
                            rc: randCode,
                            TwfID: TwfID,
                            RSA_ENCRYPT_KEY: RSA_ENCRYPT_KEY,
                            RSA_ENCRYPT_EXP: parseInt(RSA_ENCRYPT_EXP),
                        };
                    } else {
                        return Promise.reject(2004);
                    }
                    const ret = auth;
                    if (ret.TwfID != app.globalData.sessionInfo.TWFID) {
                        app.globalData.sessionInfo.TWFID = ret.TwfID;
                    }
                    encrypt.setPublic(
                        ret.RSA_ENCRYPT_KEY,
                        ret.RSA_ENCRYPT_EXP.toString(16)
                    );
                    ret["encrypted_pwd"] = encrypt.encrypt(
                        _this.data.vpnPass
                            ? _this.data.vpnPass
                            : _this.data.userPass + "_" + ret.rc
                    );
                    r(ret);
                })
                .catch((err) => {
                    console.log(err);
                    if (2004 == err)
                        wx.showToast({
                            icon: "none",
                            title: "loginAuth错误",
                        });
                    else
                        wx.showToast({
                            icon: "none",
                            title: "未知错误",
                        });
                });
        },
    },

    // 登录检测
    loginCheckFunc: {
        // WEBVPN检查登录状态
        WEBVPN: function () {
            const cookie = `language=zh_CN; privacy=1; ENABLE_RANDCODE=${_this.data.isNeedCaptcha}; TWFID=${app.globalData.sessionInfo.TWFID}`;
            WV_loginCheck(cookie).then((res) => {
                var doc = xmlParser.parseFromString(res.data);
                var msg = doc.getElementsByTagName("Message")[0]
                    .firstChild.data;
                if ("auth succ." === msg) {
                    _this.setData({
                        isWebVpnLogin: true,
                    });
                } else {
                    _this.loginFunc.WEBVPN(() => {
                        _this.loginFunc.JWGL();
                    });
                    app.globalData.sessionInfo.TWFID = "";
                }
            });
        },

        /**
         * 教务管理登录检查
         * @param {*} r
         */
        JWGL: function (r) {
            jwglLoginCheck(app.globalData.sessionInfo.JWGL_cookie +
                "; TWFID=" +
                app.globalData.sessionInfo.TWFID).then(res => {
                    if (res.data.status == 2000) {
                        _this.setData({
                            isJwglLogin: true,
                        });
                    } else {
                        _this.loginFunc.JWGL();
                    }
                });
        },

    },
});
