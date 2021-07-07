const RSA = require("../rsa/wx_rsa.js");
const config = require("../../config.js");
const log = require("../log");
const XMLParser = require("../xmldom/dom-parser");
const REQUEST = require("../request");
const xmlParser = new XMLParser.DOMParser();
var loginFailed = 0;
// RSA加密
function RSAEncrypt(unEncrypt) {
    let publicKey = config.RSAPubKey;
    var encrypt_rsa = new RSA.RSAKey();
    encrypt_rsa = RSA.KEYUTIL.getKey(publicKey);
    let encStr = encrypt_rsa.encryptLong(unEncrypt);
    let encrypted = RSA.hex2b64(encStr);
    return encrypted;
}

class LOGIN {
    constructor(globalData) {
        this.session = globalData.sessionInfo;
        this.account = globalData.accountInfo;

        this.header = {
            "content-type": "application/x-www-form-urlencoded",
        };
        this.API = globalData.API_DOMAIN;
        this.SSO = {
            SESSION: "",
            captcha: "",
            execution: "",
        };
        this.WEBVPN = {
            isNeedCaptcha: 0,
        };
    }

    /**
     * http请求封装
     * @param method 请求方法类型
     * @param url 请求路径
     * @param data 请求参数
     * @param loading 请求加载效果 {0: 正常加载, 1: 表单提交加载效果 }
     * @param loadingMsg 请求提示信息
     */
    httpBase(method, url, data, loading, loadingMsg) {
        let requestUrl = this.API + url;

        if (loading) {
            wx.showLoading({
                title: loadingMsg || "提交中...",
                mask: true,
            });
        } else {
            wx.showNavigationBarLoading();
        }

        function request(resolve, reject) {
            wx.request({
                header: {
                    "Content-Type": "application/json",
                },
                method: method,
                url: requestUrl,
                data: data,
                success: function (result) {
                    if (loading) {
                        wx.hideLoading();
                    } else {
                        wx.hideNavigationBarLoading();
                    }

                    let res = result.data || {};
                    let code = res.errorCode;

                    if (code !== 2000) {
                        reject(res);
                        if (res.errMsg) {
                            wx.showToast({
                                title: res.errMsg,
                                icon: "none",
                            });
                        }
                    } else {
                        resolve(res);
                    }
                },
                fail: function (res) {
                    reject(res);
                    if (loading) {
                        wx.hideLoading();
                    } else {
                        wx.hideNavigationBarLoading();
                    }
                    wx.showToast({
                        title: "网络出错",
                        icon: "none",
                    });
                },
            });
        }

        return new Promise(request);
    }
    httpGet({ url = "", data = {}, loading = false, loadingMsg = "" } = {}) {
        return this.httpBase("GET", url, data, loading, loadingMsg);
    }
    httpPost({ url = "", data = {}, loading = false, loadingMsg = "" } = {}) {
        return this.httpBase("POST", url, data, loading, loadingMsg);
    }
    
    ccDoLogin() {
        return this.httpPost({
            url: "/Jszx/loginRSAv1/",
            data: {
                userId: this.account.userId,
                userPass: RSAEncrypt(this.account.userPass),
            },
        }).then((data) => {
            this.session.JSZX_cookie = data.cookie;
            wx.setStorage({
                key: "JSZX_cookie",
                data: data.cookie,
            });
        });
    }
    ccCheckLogin() {
        return this.httpPost({
            url: "/Jszx/checkLogin/",
            data: {
                cookie: this.session.JSZX_cookie,
            },
        });
    }
    ccAutoLogin(r) {
        this.ccCheckLogin()
            .then(() => {
                if (r) r();
            })
            .catch((err) => {
                if (10511 == err.errorCode) {
                    wx.showToast({
                        icon: "none",
                        title: err.errMsg,
                    });
                } else if (2000 != err.errorCode) {
                    console.log("计算中心未登录，将尝试进行登录操作");
                    return this.ccDoLogin()
                        .then((res) => {
                            console.log(res);
                            if (r) r();
                        })
                        .catch((err) => {
                            if (10511 == err.errorCode) {
                                wx.showToast({
                                    icon: "none",
                                    title: err.errMsg,
                                });
                            }
                        });
                }
            });
    }
    jwglAutoLogin(r) {
        this.jwglCheckLogin()
            .then((data) => {
                console.log("JWGL Already Login");
                if (r) r();
            })
            .catch((err) => {
                this.jwglDoLogin().then((data) => {
                    this.session.JWGL_cookie = data.cookie;
                    wx.setStorage({
                        key: "JWGL_cookie",
                        data: data.cookie,
                    });
                    if (r) r();
                });
            });
    }
    jwglCheckLogin() {
        console.log("教务管理登录检测");
        return this.httpPost({
            url: "/Jwgl/loginCheck",
            data: {
                cookie:
                    this.session.JWGL_cookie + "; TWFID=" + this.session.TWFID,
            },
        });
    }
    jwglDoLogin() {
        console.log("教务管理登录操作");
        return this.httpPost({
            url: "/Jwgl/login",
            data: {
                cookie:
                    "TGC=" +
                    this.session.SSO_TGC +
                    "; TWFID=" +
                    this.session.TWFID,
            },
        });
    }
    getAdminTWFID() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: (res) => {
                    if (res.code) {
                        // request
                        this.httpGet({
                            url: "/Sys/getAdminTWFID",
                            data: { code: res.code },
                        }).then((data) => {
                            this.session.TWFID = data.twfid;
                            resolve();
                        });
                    } else {
                        reject(res);
                    }
                },
                fail: (err) => {
                    reject(err);
                },
            });
        });
    }
    webVpnAuth(isNeedCaptcha, TWFID) {
        return new Promise((resolve, reject) => {
            // https://webvpn.cuit.edu.cn/por/login_auth.csp?apiversion=1
            wx.request({
                url:
                    "https://webvpn.cuit.edu.cn/por/login_auth.csp?apiversion=1", //仅为示例，并非真实的接口地址
                header: {
                    cookie:
                        "language=zh_CN; privacy=1; ENABLE_RANDCODE=" +
                        isNeedCaptcha +
                        ";TWFID=" +
                        TWFID,
                },
                success: (res) => {
                    var doc = xmlParser.parseFromString(res.data);
                    var randCode = doc.getElementsByTagName("CSRF_RAND_CODE")[0]
                        .firstChild.data;
                    var msg = doc.getElementsByTagName("Message")[0].firstChild
                        .data;
                    var TwfID = doc.getElementsByTagName("TwfID")[0].firstChild
                        .data;
                    this.session.TWFID = TwfID;
                    var RSA_ENCRYPT_KEY = doc.getElementsByTagName(
                        "RSA_ENCRYPT_KEY"
                    )[0].firstChild.data;
                    var RSA_ENCRYPT_EXP = doc.getElementsByTagName(
                        "RSA_ENCRYPT_EXP"
                    )[0].firstChild.data;
                    if (msg == "login auth success") {
                        var auth = {
                            rc: randCode,
                            TwfID: TwfID,
                            RSA_ENCRYPT_KEY: RSA_ENCRYPT_KEY,
                            RSA_ENCRYPT_EXP: parseInt(RSA_ENCRYPT_EXP),
                        };
                        resolve(auth);
                    } else {
                        reject(2004);
                    }
                },
            });
        });
    }
    webVpnLogin(auth) {
        return new Promise((resolve, reject) => {
            wx.request({
                url:
                    "https://webvpn.cuit.edu.cn/por/login_psw.csp?anti_replay=1&encrypt=1&apiversion=1",
                method: "POST",
                data: {
                    mitm_result: "",
                    svpn_req_randcode: auth.rc,
                    svpn_name: this.account.userId,
                    svpn_password: auth.encrypted_pwd,
                    svpn_rand_code: "",
                },
                header: {
                    "content-type": "application/x-www-form-urlencoded",
                    cookie:
                        "language=zh_CN; privacy=1; ENABLE_RANDCODE=" +
                        this.WEBVPN.isNeedCaptcha +
                        "; TWFID=" +
                        auth.TwfID,
                },
                success(res) {
                    var ret = {};
                    var doc = xmlParser.parseFromString(res.data);
                    var msg = doc.getElementsByTagName("Message")[0].firstChild
                        .data;
                    var cookie = "";
                    if ("undefined" != typeof res.header["set-cookie"])
                        cookie = res.header["set-cookie"];
                    else if ("undefined" != typeof res.header["Set-Cookie"])
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
                },
            });
        });
    }
    webVpnCheckLogin() {
        return new Promise((resolve, reject) => {
            wx.request({
                url:
                    "https://webvpn.cuit.edu.cn/por/svpnSetting.csp?apiversion=1",
                header: {
                    cookie:
                        "language=zh_CN; privacy=1; ENABLE_RANDCODE=" +
                        this.WEBVPN.isNeedCaptcha +
                        "; TWFID=" +
                        this.session.TWFID,
                },
                success(res) {
                    var doc = xmlParser.parseFromString(res.data);
                    var msg = doc.getElementsByTagName("Message")[0].firstChild
                        .data;
                    resolve(msg);
                },
            });
        });
    }

    webVpnAutoLogin(r) {
        let temp = null;
        if (this.account.isAdmin) {
            temp = this.getAdminTWFID();
        } else {
            temp = Promise.resolve();
        }

        temp.then(() => {
            return this.webVpnCheckLogin();
        })
            .then((msg) => {
                if ("auth succ." == msg) {
                    console.log("WEBVPN 已登录");
                    r();
                    throw -1;
                } else {
                    console.log("WEBVPN 未登录");
                    return this.webVpnAuth(
                        this.WEBVPN.isNeedCaptcha,
                        this.session.TWFID
                    );
                }
            })
            .then((res) => {
                console.log("WEBVPN 准备登录");
                var encrypt = new RSA.RSAKey();
                encrypt.setPublic(
                    res.RSA_ENCRYPT_KEY,
                    res.RSA_ENCRYPT_EXP.toString(16)
                );
                res["encrypted_pwd"] = encrypt.encrypt(
                    this.account.vpnPass
                        ? this.account.vpnPass
                        : this.account.userPass + "_" + res.rc
                );
                return this.webVpnLogin(res);
            })
            .then((res) => {
                console.log("WebVpn登录成功");
                // 更新TWFID
                if (res != this.session.TWFID) {
                    this.session.TWFID = res;
                    wx.setStorage({
                        data: res,
                        key: "TWFID",
                    });
                }
                r();
            })
            .catch((err) => {
                console.log(err);
                if ("object" != typeof err) return;
                var doc = err.doc;
                var code = doc.getElementsByTagName("ErrorCode")[0].firstChild
                    .data;
                if (code == 20021) {
                    console.log("已是登录状态");
                    r();
                } else if (code == 20004) {
                    console.log("账号信息错误");
                    if (err.needCaptcha) {
                        // _this.getCaptcha();
                    }
                } else if (code == 20041) {
                    console.log("错误次数过多");
                    // _this.getCaptcha();
                } else if (code == 20023) {
                    console.log("验证码错误");
                    // _this.getCaptcha();
                }
            });
    }

    // 统一登录中心
    ssoAutoLogin(r) {
        this.ssoCheckLogin()
            .then((res) => {
                this.SSO.SESSION = res.SESSION;
                // 获取验证码
                return this.ssoGetCaptcha(res.SESSION);
            })
            .then((res) => {
                // 取得验证码
                var cookie = "";
                if ("undefined" != typeof res.header["set-cookie"])
                    cookie = res.header["set-cookie"];
                else if ("undefined" != typeof res.header["Set-Cookie"])
                    cookie = res.header["Set-Cookie"];
                if (-1 != cookie.indexOf("SESSION")) {
                    this.SSO.SESSION = cookie.match(/SESSION=(.*);/)[1];
                }
                // 识别验证码
                return this.captchaDecode(res.data);
            })
            .then((code) => {
                // 尝试登录
                return this.ssoDoLogin({
                    SSO_SESSION: this.SSO.SESSION,
                    userId: this.account.userId,
                    userPass: this.account.userPass,
                    captcha: code,
                    execution: this.SSO.execution,
                });
            })
            .then((res) => {
                var tgc = res.match(/TGC=(.*?);/);
                this.session.SSO_TGC = tgc[1];

                wx.setStorage({
                    data: tgc[1],
                    key: "SSO_TGC",
                });
                console.log("SSO Login Success");
                r();
            })
            .catch((err) => {
                console.log(err);
                if (err.code == 12405) {
                    loginFailed++;
                    if (loginFailed <= 3) {
                        console.log("第" + loginFailed + "次重试");
                        this.autoLogin();
                    }
                    return;
                }else if (12200 == err.code) {
                    console.log("SSO Already Login");
                    r();
                } else if (12401 === err.code) {
                    wx.showToast({
                        icon: "none",
                        title: err.errMsg,
                    });
                    wx.setStorage({
                        key: "isAutoLogin",
                        data: false,
                    });
                }
            });
    }
    ssoDoLogin(data) {
        return new Promise((resolve, reject) => {
            if (0 == data.userId.length || 0 == data.userPass.length) {
                reject({
                    code: -3,
                    errMsg: "账号密码格式不正确",
                });
            }
            wx.request({
                url: "https://sso.cuit.edu.cn/authserver/login",
                method: "POST",
                header: {
                    Cookie: "SESSION=" + data.SSO_SESSION,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data: {
                    execution: data.execution,
                    _eventId: "submit",
                    lm: "usernameLogin",
                    geolocation: "",
                    username: data.userId,
                    password: data.userPass,
                    captcha: data.captcha,
                },

                success: (res) => {
                    if (!res.data) resolve(-1);
                    const html = res.data;
                    if("string" !== typeof html)
                    {
                        log.info(JSON.stringify(res))
                        reject({ code: 0, errMsg: "预期之外的异常" });
                    }
                    if (html.indexOf("已经成功登统一认证中心") != -1) {
                        // 处理cookie
                        var cookie = "";
                        if ("undefined" != typeof res.header["set-cookie"])
                            cookie = res.header["set-cookie"];
                        else if ("undefined" != typeof res.header["Set-Cookie"])
                            cookie = res.header["Set-Cookie"];
                        resolve(cookie);
                    } else if (html.indexOf("用户名或密码错误") != -1) {
                        reject({ code: 12401, errMsg: "用户名或密码错误" });
                    } else if (html.indexOf("必须录入") != -1) {
                        reject({ code: 12401, errMsg: "数据缺失" });
                    } else if (html.indexOf("账号被锁定") != -1) {
                        var unlockTime = html.match(
                            /账号被锁定，请在(.*?)后重新登录/
                        )[1];
                        reject({
                            code: 12403,
                            errMsg: "账号被锁定至" + unlockTime,
                        });
                    } else if (html.indexOf("禁用") != -1) {
                        reject({ code: 12403, errMsg: "账号被禁用！" });
                    }else if (
                        html.indexOf("必须录入验证码") != -1 ||
                        -1 != html.indexOf("验证码无效")
                    ) {
                        resolve({ code: 12405, errMsg: "验证码有误" });
                    }else{
                        reject({
                            code: 0,
                            errMsg: '未知异常'
                        })
                    }
                },
                fail: (err) => {
                    console.error("失败", err);
                    wx.showToast({
                        icon: "none",
                        title: "网络异常",
                    });
                },
            });
        });
    }
    ssoGetCaptcha(SESSION) {
        console.log("SSO GET CAPTCHA.");
        return new Promise((resolve, reject) => {
            wx.request({
                url: "https://sso.cuit.edu.cn/authserver/captcha",
                responseType: "arraybuffer",
                header: {
                    cookie: "SESSION=" + SESSION,
                },
                success(res) {
                    resolve(res);
                },
                fail: (err) => {
                    reject(-2);
                },
            });
        });
    }
    ssoCheckLogin() {
        return new Promise((resolve, reject) => {
            wx.request({
                url: "https://sso.cuit.edu.cn/authserver/login",
                header: {
                    cookie:
                        "SESSION=" +
                        this.session.SSO_SESSION +
                        "; TGC=" +
                        this.session.SSO_TGC,
                },
                success: (res) => {
                    var ret = {};
                    if (res.data.indexOf("已经成功登统一认证中心") != -1) {
                        reject({ code: 12200 });
                    } else if (
                        res.data.indexOf("成都信息工程大学统一身份") != -1
                    ) {
                        console.log("SSO NOT LOGIN.");
                        // 未登录统一认证中心
                        ret["status"] = 12401;
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
                            this.SSO.execution = ret[
                                "execution"
                            ] = res.data.match(
                                /" name="execution" value="(.*?)" \/>/
                            )[1];
                        }
                        resolve(ret);
                    }
                },
            });
        });
    }
    autoLogin() {
        if (
            0 == this.account.userId.length ||
            0 == this.account.userPass.length
        ) {
            console.log({
                code: -3,
                errMsg: "账号密码格式不正确",
            });
            return null;
        }
        console.log("Auto Login Start");
        return new Promise((resolve, reject) => {
            this.ssoAutoLogin(() => {
                this.ccAutoLogin(() => {
                    this.webVpnAutoLogin(() => {
                        this.jwglAutoLogin(() => {
                            wx.showToast({
                                title: "自动登录成功！",
                            });
                            resolve();
                        });
                    });
                });
            });
        });
    }

    yktLogin() {
        return REQUEST.httpPostForm({
            url: "/Card/login",
            data: {
                cookie: this.session.SSO_TGC,
            },
        });
    }
    /**
     * ORC识别验证码
     *
     * @param pic arraybuffer
     *
     */
    captchaDecode(pic) {
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
            return new Promise((resolve, reject) => {
                wx.request({
                    url: this.API + "/Tool/captchaDecodeV2",
                    method: "POST",
                    header: {
                        "x-verify": RSAEncrypt(verify),
                    },
                    data: pic,
                    success: (res) => {
                        if (2000 == res.data.status) resolve(res.data.result);
                        else if (res.data.errMsg) {
                            wx.showToast({
                                icon: "none",
                                title: res.data.errMsg,
                            });
                        } else {
                            console.log(res.data);
                            wx.showToast({
                                icon: "none",
                                title: "未知错误",
                            });
                        }
                        return;
                    },
                    fail: (err) => {
                        reject({ code: -2, errMsg: err });
                    },
                });
            });
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = {
    DoLogin: LOGIN,
};
