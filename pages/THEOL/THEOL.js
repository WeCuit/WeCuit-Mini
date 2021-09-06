// pages/THEOL/THEOL.js
const app = getApp();

Page({
    /**
     * 页面的初始数据
     */
    data: {
        sessionInfo: null,
        isFirstLoginTry: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.sessionInfo = app.globalData.sessionInfo;
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.onPullDownRefresh();
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
        wx.showLoading({ title: "加载课程列表~" });
        this.getCourseList()
            .then((res) => {
                this.setData({
                    list: res.list,
                });
                wx.hideLoading();
            })
            .catch((err) => {
                // 教学平台未登录
                if ("undefined" !== typeof err.theolCookie) {
                    // cookie需要更新
                    this.sessionInfo.theolCookie = err.theolCookie;
                    wx.setStorage({
                        key: "theolCookie",
                        data: err.theolCookie,
                    });
                }
                // 尝试登录教学平台
                if (21401 == err.errorCode) {
                    if(this.data.isFirstLoginTry){
                        this.data.isFirstLoginTry = false;
                        this.THEOL_Login(this.sessionInfo.theolCookie).then(
                            this.onPullDownRefresh
                        ).catch(err=>{
                            console.log(err)
                            if(12401 == err.errorCode)
                            {
                                this.data.isFirstLoginTry = true
                                setTimeout(()=>{
                                    wx.navigateTo({
                                        url: "../my/sso/sso",
                                    });
                                }, 1000)
                            }
                        });
                    }
                } else {
                    if (err.errMsg) {
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

    // 获取课程列表
    getCourseList: function () {
        return app.httpPost({
            url: "/Theol/courseList",
            data: {
                cookie: this.sessionInfo.theolCookie,
            },
        });
    },

    // 登录
    THEOL_Login: function (theolCookie) {
        return app.httpPost({
            url: "/Theol/login",
            data: {
                SSO_TGC: this.sessionInfo.SSO_TGC,
                theolCookie: theolCookie,
            },
        });
    },
    bindViewCourseDir: function (e) {
        var data = e.currentTarget.dataset;
        wx.navigateTo({
            url: "tree/tree?courseId=" + data.courseid,
        });
    },
});
