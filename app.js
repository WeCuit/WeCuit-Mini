//app.js
const RSA = require("utils/rsa/wx_rsa.js");
const config = require("config.js");
const login = require("/utils/login/login");
const log = require("utils/log");
const request = require("utils/request");

App({
    onLaunch: function (e) {
        console.log("APP onLaunch", e);

        // 初始化数据
        this.initData();

        // =========版本升级检测===============
        this.checkUpdate();

        this.loginClass = new login.DoLogin(this.globalData);
        this.globalData.autoLoginProcess =  Promise.resolve()
        this.getUserInfo().then((res) => {
            if("string" != typeof res.openid){
                wx.showToast({
                    icon: 'none',
                    title: '用户数据获取异常，请重启程序'
                })
            }
            this.globalData.openid = res.openid;
            this.globalData.accountInfo.isAdmin = res.isAdmin;
            if (this.globalData.accountInfo.isAutoLogin){
                wx.showLoading({title: '自动登录中~'})
                this.globalData.autoLoginProcess =  this.loginClass.autoLogin();
            }else{
                this.globalData.autoLoginProcess =  Promise.resolve()
                console.log("未启用自动登录");
            }
        }).catch(e=>{
        });
        request.init(config.API_DOMAIN);
    },

	httpGet: request.httpGetForm,
	httpPost: request.httpPostForm,
	httpPostJson: request.httpPostJson,

    // 小程序发生脚本错误或 API 调用报错时触发。
    onError: function (e) {
        console.error('onError', e);
        log.info("onError" + JSON.stringify(e));
    },
    onUnhandledRejection: function (e) {
        log.info("onUnhandledRejection" + JSON.stringify(e));
        console.error('onUnhandledRejection', e);
        if("string" == typeof e.errMsg){
            wx.showToast({
                icon: "none",
                title: e.errMsg,
            });
        }
    },

    // 初始化数据
    initData: function () {
        wx.getSystemInfo({
            success: (res) => {
                this.globalData.windowHeight = res.windowHeight;
                this.globalData.windowWidth = res.windowWidth;
            },
            fail(err) {
                console.log(err);
            },
        });

        let ai = wx.getStorageSync("accountInfo");
        if (ai) this.globalData.accountInfo = ai;

        wx.getStorage({
            key: "isADClose",
            success: (res) => {
                this.globalData.isADClose = res.data;
            },
        });
        if (this.globalData.accountInfo.isAutoLogin) {
            this.globalData.isUser = wx.getStorageSync("isUser");
            this.globalData.sessionInfo.JSZX_cookie = wx.getStorageSync(
                "JSZX_cookie"
            );
            this.globalData.sessionInfo.JWGL_cookie = wx.getStorageSync(
                "JWGL_cookie"
            );
            this.globalData.sessionInfo.theolCookie = wx.getStorageSync(
                "theolCookie"
            );
            this.globalData.sessionInfo.SSO_SESSION = wx.getStorageSync(
                "SSO_SESSION"
            );
            this.globalData.sessionInfo.SSO_TGC = wx.getStorageSync("SSO_TGC");
            this.globalData.sessionInfo.TWFID = wx.getStorageSync("TWFID");
        } else {
            wx.getStorage({
                key: "isUser",
                success: (res) => {
                    this.globalData.isUser = res.data;
                },
            });
            wx.getStorage({
                key: "JSZX_cookie",
                success: (res) => {
                    this.globalData.sessionInfo.JSZX_cookie = res.data;
                },
            });
            wx.getStorage({
                key: "JWGL_cookie",
                success: (res) => {
                    this.globalData.sessionInfo.JWGL_cookie = res.data;
                },
            });
            wx.getStorage({
                key: "theolCookie",
                success: (res) => {
                    this.globalData.sessionInfo.theolCookie = res.data;
                },
            });
            wx.getStorage({
                key: "SSO_SESSION",
                success: (res) => {
                    this.globalData.sessionInfo.SSO_SESSION = res.data;
                },
            });
            wx.getStorage({
                key: "SSO_TGC",
                success: (res) => {
                    this.globalData.sessionInfo.SSO_TGC = res.data;
                },
            });
            wx.getStorage({
                key: "TWFID",
                success: (res) => {
                    this.globalData.sessionInfo.TWFID = res.data;
                },
            });
        }
        // 课程表数据
        this.globalData.start = wx.getStorageSync("start");
        this.globalData.classtable = wx.getStorageSync("classtable");
        this.globalData.location = wx.getStorageSync("location");
        // 初始化数据end
    },

    /**
     * 获取用户属性
     *
     * isAdmin, openid
     */
    getUserInfo: function () {
        return new Promise((resolve, reject) => {
            wx.getStorage({
                key: "UserInfo",
                success: (res) => {
                    // 本地有存储信息就直接用
                    if (res.data) {
                        /**
                         * {
                         *    isAdmin: boolean,
                         *    openid: *****
                         * }
                         */
                        resolve(res.data);
                    }
                },
                fail: (err) => {
                    console.error(err);
                    // 本地信息获取失败，远程获取
                    this.login().then((code) => {
                        this.httpGet({
                            url: "/Sys/getUserInfoV2",
                            data: { code: code }
                        }).then((data)=>{
                            if ("object" == typeof data) {
                                wx.setStorage({
                                    key: "UserInfo",
                                    data: data.info,
                                });
                                /**
                                 * {
                                 *    isAdmin: boolean,
                                 *    openid: *****
                                 * }
                                 */
                                resolve(data.info);
                            } else {
                                reject(data);
                            }
                        })
                    });
                },
            });
        });
    },

    // =========版本升级检测===============
    checkUpdate: function () {
        const updateManager = wx.getUpdateManager();
        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
            console.log(res.hasUpdate);
        });
        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: "更新提示",
                content: "新版本已经准备好，是否重启应用？",
                success(res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate();
                    }
                },
            });
        });
    },
    login: function () {
        return new Promise((resolve, reject) => {
            wx.login({
                success: (res) => {
                    if (res.code) resolve(res.code);
                    else reject(res);
                },
                fail: (err) => {
                    reject(err);
                },
            });
        });
    },
    RSAEncrypt: function (unencrypt) {
        let publicKey = config.RSAPubKey;
        var encrypt_rsa = new RSA.RSAKey();
        encrypt_rsa = RSA.KEYUTIL.getKey(publicKey);
        let encStr = encrypt_rsa.encryptLong(unencrypt);
        let encrypted = RSA.hex2b64(encStr);
        return encrypted;
    },

    globalData: {
        API_DOMAIN: config.API_DOMAIN,
        start: null,
        classtable: null,
        checkInList: null,
        location: null,
        openid: "",
        accountInfo: {
            isAdmin: false,
            userId: "",
            userPass: "",
            vpnPass: "",
            isRemPass: false,
            isAutoLogin: false,
        },
        isUser: false,
        sessionInfo: {
            JWGL_cookie: "",
            SSO_TGC: "",
            JSZX_cookie: "",
            theolCookie: "",
        },
        config: {
            github: "",
            group: "",
        },
        isADClose: "undefined" !== typeof qq ? false : true,
        autoLoginProcess: null,
    },
});
