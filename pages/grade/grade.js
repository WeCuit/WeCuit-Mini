// pages/grade/grade.js
const app = getApp();
import { genQuerySign } from "../../utils/tool";

Page({
    /**
     * 页面的初始数据
     */
    data: {
        grade: [],
        total: {},
        isGradeSub: false,
        isSysSub: false,
        sessionInfo: {},
        isFirstOpenSSO: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.sessionInfo = app.globalData.sessionInfo;
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        wx.showShareMenu({
            withShareTicket: true,
            // for wx
            menus: ["shareAppMessage", "shareTimeline"],
            // for qq
            showShareItems: ["qq", "qzone", "wechatFriends", "wechatMoment"],
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.globalData.autoLoginProcess.then(() => {
            // this.getExamSubStatus();
            this.gradeQueryV2();
        });
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.gradeQueryV2();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {},

    /**
     * 分享至微信朋友圈
     */
    onShareTimeline: function (e) {
        // console.log(e)
        return {
            title: "个人课表",
            query: "",
        };
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: "个人课表",
            // for wechat
            path: "/pages/grade/grade",
            // for qq
            query: "",
        };
    },
    gradeQueryV2: function () {
        wx.showLoading({ title: "请求中~" });
        app.httpPost({
            url: "/Jwgl/getGradeTableV2/",
            data: {
                cookie:
                    this.data.sessionInfo.JWGL_cookie +
                    "; TWFID=" +
                    this.data.sessionInfo.TWFID,
            },
        })
            .then((data) => {
                wx.hideLoading();
                wx.stopPullDownRefresh();
                this.setData({
                    grade: data.grade,
                    total: data.total,
                });
            })
            .catch((err) => {
                wx.hideLoading();
                wx.stopPullDownRefresh();
                this.handelERR(err);
            })
    },
    // 获取成绩提醒订阅状态
    getExamSubStatus: function () {
        app.httpPost({
            url: "/Task/gradeStatusV2",
            data: {
                openid: app.globalData.openid,
                sign: genQuerySign(
                    "/Task/gradeStatusV2/",
                    app.globalData.openid
                ),
            },
        })
            .then((data) => {
                this.setData({
                    isGradeSub: data.data.gradeSub,
                    isSysSub: data.data.sysSub,
                });
            })
            .catch((err) => {})
    },
    // 改变订阅状态
    changeSubStatus: function (e) {
        app.httpPost({
            url: "/Task/gradeInfoV2",
            data: {
                openid: app.globalData.openid,
                value: e.detail.value?'1':'0',
                sign: genQuerySign(
                    "/Task/gradeInfoV2/",
                    app.globalData.openid,
                    e.detail.value?'1':'0'
                ),
            },
        })
            .then((data) => {
                wx.showToast({
                    title: "修改成功",
                });
            })
            .catch((err) => {
                this.setData({
                    isGradeSub: !e.detail.value,
                });
                if (err.errMsg)
                    wx.showToast({
                        icon: "none",
                        title: err.errMsg,
                    });
            });
    },
    handelERR: function (err) {
        if (13401 === err.errorCode) {
            wx.showToast({
                icon: "none",
                title: err.errMsg,
            });
            if (this.data.isFirstOpenSSO) {
                this.data.isFirstOpenSSO = false;
                wx.navigateTo({
                    url: "../my/sso/sso",
                });
            }
        } else if (err.errMsg) {
            wx.showToast({
                icon: "none",
                title: err.errMsg,
            });
        } else {
            console.error(err);
            wx.showToast({
                icon: "none",
                title: "未知异常",
            });
        }
    },
});
