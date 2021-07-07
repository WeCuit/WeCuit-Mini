// pages/JSZX/jkdk.js
const app = getApp();

Page({
    /**
     * 页面的初始数据
     */
    data: {
        list: {
            today: [
                {
                    title: "少女祈祷中......",
                    status: "X",
                },
            ],
        },
        JSZX_cookie: "",
        sessionInfo: {},
        isFirstTry: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {},

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.data.sessionInfo = app.globalData.sessionInfo;
        if (app.globalData.checkInList)
            this.setData({
                list: app.globalData.checkInList,
            });
        else this.onPullDownRefresh();
    },

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
    onUnload: function () {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        wx.showLoading({ title: "获取打卡列表~" });
        app.globalData.autoLoginProcess
            .then(() => {
                return this.getCheckInList();
            })
            .then((data) => {
                this.setData({
                    list: data.list,
                });
                app.globalData.checkInList = data.list;
                wx.hideLoading();
                return Promise.reject(null);
            })
            .catch((err) => {
                if (null === err) return Promise.reject(null);
                if (20401 == err.errorCode) {
                    // 错误码：未登录
                    if (app.globalData.isUser && this.data.isFirstTry) {
                        this.data.isFirstTry = false;
                        wx.showLoading({
                            title: '尝试登录~'
                        })
                        app.loginClass.ccDoLogin().then(this.onPullDownRefresh);
                    } else {
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
                    console.log(err);
                    wx.showToast({
                        icon: "none",
                        title: "未知异常",
                    });
                }
                return Promise.reject(null);
            })
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
            title: "健康打卡",
        };
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: "健康打卡",
            // for wechat
            path: "/pages/attendance/list",
            // for qq
            query: "",
        };
    },
    getCheckInList: function () {
        return app.httpPost({
            url: "/Jszx/getCheckInListV2/",
            data: {
                cookie: this.data.sessionInfo.JSZX_cookie,
            },
        });
    },
    openCheckIn: function (e) {
        if (e.currentTarget.dataset.link)
            wx.navigateTo({
                url:
                    "/pages/checkIn/edit?link=" +
                    encodeURIComponent(e.currentTarget.dataset.link),
            });
    },
});
