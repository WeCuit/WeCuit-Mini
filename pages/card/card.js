// pages/card/card.js
const app = getApp();
import Card from "../../utils/card";
const card = new Card.Card(app.globalData.API_DOMAIN);
import { drawById } from "../../utils/qrcode";

var qrCodeInfoInterval = null;
var _this = null;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        userName: "姓名",
        CARD_AccNum: 0,
        wallet: [
            {
                WalletNum: "1",
                WalletName: "主钱包",
                MonDBCurr: "0.00",
                IsOpen: "0",
            },
            {
                WalletNum: "9",
                WalletName: "库钱包1",
                MonDBCurr: "0.00",
                IsOpen: "0",
            },
        ],
        actions: [
            {
                text: "充值",
                font: "icon-charge",
                action: "bindChargeAct",
                data: "",
            },
        ],
        DealRec: [],
        showQRCode: false,
        qrAPI: app.globalData.API_DOMAIN + "/UTILS/genQRCode/?str=",
        qrCode: null,
        showPayRet: false,
        payRet: {},
        refresh: [
            {
                text: "点击刷新二维码",
                font: "icon-shuaxin",
            },
            {
                text: "正在刷新二维码",
                font: "icon-shuaxin refresh",
            },
            {
                text: "已刷新",
                font: "icon-success",
            },
        ],
        refreshStatus: 0,
        screenBrightness: 0,
        windowWidth: app.globalData.windowWidth,
        firstSSOLogin: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        _this = this;
        wx.getStorage({
            key: "CARD_AccNum",
            success: (res) => {
                if (res.data) {
                    this.data.CARD_AccNum = res.data;
                    this.getWalletDetail();
                    this.getDealRec(0, "", 0, 0);
                }
            },
            fail: (err) => {
                this.loginYKT((res) => {
                    if (res) {
                        this.getWalletDetail();
                        this.getDealRec(0, "", 0, 0);
                    }
                });
            },
        });
        wx.getScreenBrightness({
            success: (res) => {
                this.data.screenBrightness = res.value;
            },
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {},

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        if (qrCodeInfoInterval) {
            clearInterval(qrCodeInfoInterval);
            qrCodeInfoInterval = null;
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.loginYKT((res) => {
            if (res) {
                this.getWalletDetail();
                this.getDealRec(0, "", 0, 0);
            }
        });
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {},

    // 一卡通登录
    loginYKT: function (r) {
        wx.showLoading({
            title: "登录中~",
        });

        app.loginClass
            .yktLogin()
            .then((data) => {
                wx.stopPullDownRefresh();
                wx.hideLoading();
                this.data.CARD_AccNum = data.data.AccNum;
                wx.setStorage({
                    data: data.data.AccNum,
                    key: "CARD_AccNum",
                });
                r(true);
            })
            .catch((err) => {
                if (12401 == err.errorCode && this.data.firstSSOLogin) {
                    this.data.firstSSOLogin = false;
                    wx.navigateTo({
                        url: "../my/sso/sso",
                    });
                } else if (err.errMsg) {
                    wx.showToast({
                        icon: "none",
                        title: err.errMsg,
                    });
                } else {
                    wx.showToast({
                        icon: "none",
                        title: "未知异常",
                    });
                }
            });
    },

    // 获取钱包金额
    getWalletDetail: function () {
        app.httpPost({
            url: "/Card/getAccWallet",
            data: {
                AccNum: this.data.CARD_AccNum,
            },
        }).then((data) => {
            this.setData({
                wallet: data.Rows[0].WalletRows,
                userName: data.Rows[0].AccName,
            });
        });
    },

    /**
     * 获取详细流水信息
     * @param {*} begin 开始时间 年月日
     * @param {*} end 截止时间 年月日
     * @param {*} type  类型 全部0|充值1|转账2|消费3|其它4
     * @param {*} walletNum  0所有钱包|指定钱包编号
     */
    getDealRec: function (begin, end, type, walletNum) {
        app.httpPost({
            url: "/Card/getDealRec",
            data: {
                AccNum: this.data.CARD_AccNum,
                // 年月日
                BeginDate: begin,
                // 年月日
                EndDate: end,
                // 类型 全部0|充值1|转账2|消费3|其它4
                Type: type,
                ViceAccNum: -1,
                // 0所有钱包|指定钱包编号
                WalletNum: walletNum,
                RecNum: 1,
                Count: 10,
            },
        }).then((data) => {
            this.setData({
                DealRec: data.Rows,
            });
        });
    },

    // 用户尝试点击充值按钮
    bindChargeAct: function (e) {
        if ("undefined" !== typeof qq) {
            wx.showModal({
                title: "需要使用“易校园”小程序",
                content:
                    "QQ没有“易校园”小程序，故暂不支持该功能，如需充值请使用微信小程序",
                showCancel: false,
            });
            return;
        }
        wx.showModal({
            title: "需要使用易校园",
            content: "当前操作需使用易校园小程序，确定将尝试打开“易校园”小程序",
            success(res) {
                if (res.confirm) {
                    wx.navigateToMiniProgram({
                        appId: "wxe825270ae451b798",
                        path: "pages/card/pages/rechargeCard/rechargeCard",
                    });
                } else if (res.cancel) {
                    wx.showToast({
                        icon: "none",
                        title: "阁下取消了本次操作",
                    });
                }
            },
        });
    },
    QRCode: {
        // 查询支付状态
        getInfo: function () {
            card.queryPayStatus(_this.data.QRCode)
                .then((res) => {
                    if (2000 == res.data.status) {
                        if ("1" == res.data.Recflag) {
                            wx.showToast({
                                title: "支付成功",
                            });
                        } else if ("2" == res.data.Recflag) {
                            wx.showToast({
                                icon: "none",
                                title: "交易失败",
                            });
                        } else if (
                            "undefined" == typeof res.data.Recflag ||
                            "0" !== res.data.Recflag
                        ) {
                            wx.showToast({
                                icon: "none",
                                title: "未知错误",
                            });
                            clearInterval(qrCodeInfoInterval);
                            wx.setNavigationBarColor({
                                frontColor: "#000000",
                                backgroundColor: "#fff",
                            });
                            wx.setScreenBrightness({
                                value: _this.data.screenBrightness,
                            });
                            wx.setNavigationBarTitle({ title: "支付结果" });
                            _this.setData({
                                showQRCode: !_this.data.showQRCode,
                                showPayRet: true,
                                payError:
                                    "可以的话，请截图给开发者" +
                                    JSON.stringify(res.data),
                            });
                            return;
                        }
                        if ("1" == res.data.Recflag) {
                            clearInterval(qrCodeInfoInterval);
                            qrCodeInfoInterval = null;
                            res.data.MonDeal = res.data.MonDeal.toFixed(2);
                            res.data.MonDealCur = res.data.MonDealCur.toFixed(
                                2
                            );
                            res.data.ConcessionsMon = res.data.ConcessionsMon.toFixed(
                                2
                            );
                            res.data.ConsumeMgFee = res.data.ConsumeMgFee.toFixed(
                                2
                            );
                            wx.setNavigationBarColor({
                                frontColor: "#000000",
                                backgroundColor: "#fff",
                            });
                            wx.setScreenBrightness({
                                value: _this.data.screenBrightness,
                            });
                            wx.setNavigationBarTitle({ title: "支付结果" });
                            _this.setData({
                                showQRCode: !_this.data.showQRCode,
                                showPayRet: true,
                                payRet: res.data,
                            });
                        }
                    } else {
                        wx.showToast({
                            icon: "none",
                            title: "未知错误",
                        });
                        clearInterval(qrCodeInfoInterval);
                        wx.setNavigationBarColor({
                            frontColor: "#000000",
                            backgroundColor: "#fff",
                        });
                        wx.setScreenBrightness({
                            value: _this.data.screenBrightness,
                        });
                        wx.setNavigationBarTitle({ title: "支付结果" });
                        _this.setData({
                            showQRCode: !_this.data.showQRCode,
                            showPayRet: true,
                            payError:
                                "可以的话，请截图给开发者" +
                                JSON.stringify(res.data),
                        });
                        return;
                    }
                })
                .catch((err) => {
                    clearInterval(qrCodeInfoInterval);
                    wx.showToast({
                        icon: "none",
                        title: "请求失败",
                    });
                    wx.setNavigationBarColor({
                        frontColor: "#000000",
                        backgroundColor: "#fff",
                    });
                    wx.setScreenBrightness({
                        value: _this.data.screenBrightness,
                    });
                    wx.setNavigationBarTitle({ title: "支付结果" });
                    _this.setData({
                        showQRCode: !_this.data.showQRCode,
                        showPayRet: true,
                        payError: err.errMsg,
                    });
                });
        },
    },
    // 全屏预览二维码
    previewQRCode: function () {
        wx.previewImage({
            urls: [this.data.qrAPI + this.data.qrCode],
        });
    },

    // 刷新二维码
    refreshQRCode: function () {
        clearInterval(qrCodeInfoInterval);
        qrCodeInfoInterval = null;
        this.setData({ refreshStatus: 1 });
        card.getPayQRCode(_this.data.CARD_AccNum)
            .then((res) => {
                _this.data.QRCode = res.data.QRCode;
                drawById.call(wx, "payQrcode", {
                    text: res.data.QRCode, // 二维码内容
                    width: _this.data.windowWidth * 0.9, // 宽度 px内容自动转换像素比
                    height: _this.data.windowWidth * 0.9, // 高度
                });
                this.setData({ refreshStatus: 2 });
                qrCodeInfoInterval = setInterval(this.QRCode.getInfo, 5000);
                setTimeout(() => {
                    this.setData({ refreshStatus: 0 });
                }, 1000);
            })
            .catch((err) => {
                wx.showToast({
                    title: err.errMsg,
                    icon: "none",
                });
            });
    },

    // 切换显示二维码
    bindShowQRCode: function (e) {
        if (e.currentTarget.dataset.type) {
            // 显示二维码
            wx.setNavigationBarTitle({ title: "付款码" });
            wx.setNavigationBarColor({
                frontColor: "#ffffff",
                backgroundColor: "#ff5c15",
            });
            wx.setScreenBrightness({ value: 1 });
            card.getPayQRCode(_this.data.CARD_AccNum)
                .then((res) => {
                    _this.data.QRCode = res.data.QRCode;
                    drawById.call(wx, "payQrcode", {
                        text: res.data.QRCode, // 二维码内容
                        width: _this.data.windowWidth * 0.9, // 宽度 px内容自动转换像素比
                        height: _this.data.windowWidth * 0.9, // 高度
                    });
                    qrCodeInfoInterval = setInterval(this.QRCode.getInfo, 2000);
                })
                .catch((err) => {
                    wx.showToast({
                        title: err.errMsg,
                        icon: "none",
                    });
                });
        } else {
            // 关闭二维码
            console.log("调整屏幕亮度至-->" + this.data.screenBrightness);
            wx.setNavigationBarTitle({ title: "我的一卡通" });
            wx.setNavigationBarColor({
                frontColor: "#000000",
                backgroundColor: "#fff",
            });
            wx.setScreenBrightness({ value: this.data.screenBrightness });
            clearInterval(qrCodeInfoInterval);
            qrCodeInfoInterval = null;
        }
        this.setData({ showQRCode: !this.data.showQRCode });
    },
    // 付款结果
    bindShowPayRet: function () {
        wx.setNavigationBarTitle({ title: "我的一卡通" });
        this.setData({ showPayRet: !this.data.showPayRet });
        this.getWalletDetail();
        this.getDealRec(0, "", 0, 0);
    },
});
