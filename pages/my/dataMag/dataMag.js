// pages/my/dataMag/dataMag.js
const app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {},

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
    onUnload: function () {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {},

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {},
    showConfirm: function (text) {
        return new Promise((resolve, reject) => {
            wx.showModal({
                title: "Warning",
                content: text,
                confirmColor: "red",
                success: (res) => {
                    if (res.confirm) {
                        resolve();
                    } else if (res.cancel) {
                        wx.showToast({
                            icon: "none",
                            title: "取消",
                        });
                        reject();
                    }
                },
            });
        });
    },
    bindCleanCourse: function () {
        this.showConfirm("是否清空本地课表数据？").then(() => {
            app.globalData.classtable = null;
            app.globalData.start = null;
            app.globalData.location = null;
            wx.removeStorageSync("classtable");
            wx.removeStorageSync("start");
            wx.removeStorageSync("location");
            wx.showToast({
                title: "清除完毕",
            });
        });
    },
    bindCleanAccount: function () {
        this.showConfirm("是否清空本地账号数据？").then(() => {
            app.globalData.sessionInfo.isRemPass = app.globalData.sessionInfo.userId = app.globalData.sessionInfo.userPass = null;
            wx.removeStorageSync("accountInfo");
            wx.showToast({
                title: "清除完毕",
            });
        });
    },
    bindClearAll: function () {
        this.showConfirm("是否清空本地所有数据？").then(() => {
            (app.globalData.start = null),
                (app.globalData.classtable = null),
                (app.globalData.checkInList = null),
                (app.globalData.isAutoLogin = false),
                (app.globalData.location = null),
                ((app.globalData.accountInfo = {
                    isAdmin: app.globalData.accountInfo.isAdmin,
                    userId: "",
                    userPass: "",
                    vpnPass: "",
                    isRemPass: false,
                    isAutoLogin: false,
                }),
                (app.globalData.sessionInfo = {
                    JWGL_cookie: "",
                    SSO_TGC: "",
                    JSZX_cookie: "",
                }));
            wx.clearStorage({
                success: (option) => {
                    console.log(option);
                    wx.showToast({
                        title: "清除完毕",
                    });
                },
            });
        });
    },
});
