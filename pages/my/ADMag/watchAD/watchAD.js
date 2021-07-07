// pages/watchAD/watchAD.js

var InterstitialAd = null;
var videoAd = null;
var InterstitialAd_timeout = null

Page({
    /**
     * Page initial data
     */
    data: {},

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {},

    /**
     * Lifecycle function--Called when page is initially rendered
     */
    onReady: function () {
        // this.AD_box();
        videoAd = wx.createRewardedVideoAd({
            adUnitId: "bb4d8c56d8a3852de532e389f329f10a",
        });
        /* 建议放在onReady里执行，提前加载广告 */
        InterstitialAd = wx.createInterstitialAd({
            adUnitId: "2ad3e6c8da66801a9da798a6a006847b",
        });
        InterstitialAd.load().catch((err) => {
            console.error("load", err);
        });
        InterstitialAd.onLoad(() => {
            console.log("onLoad event emit");
        });
        InterstitialAd.onClose(() => {
            console.log("close event emit");
        });
        InterstitialAd.onError((e) => {
            console.log("error", e);
        });
    },

    /**
     * Lifecycle function--Called when page show
     */
    onShow: function () {
        InterstitialAd_timeout = setTimeout(this.AD_IScreen, 30 * 1000)
    },

    /**
     * Lifecycle function--Called when page hide
     */
    onHide: function () {
        clearTimeout(InterstitialAd_timeout)
    },

    /**
     * Lifecycle function--Called when page unload
     */
    onUnload: function () {
        clearTimeout(InterstitialAd_timeout)
    },

    /**
     * Page event handler function--Called when user drop down
     */
    onPullDownRefresh: function () {},

    /**
     * Called when page reach bottom
     */
    onReachBottom: function () {},

    /**
     * Called when user click on the top right corner to share
     */
    onShareAppMessage: function () {},

    // 插屏广告
    AD_IScreen: function () {
        /* 建议放在需要展示插屏广告的时机执行 */
        InterstitialAd.show().catch((err) => {
            console.error("show", err);
            wx.showModal({
                title: "出错了",
                content: err.errMsg,
                showCancel: false,
            });
        });
    },

    // 盒子广告
    AD_box: function () {
        let appbox = wx.createAppBox({
            adUnitId: "7b53a3d9df5f054de548988860f206e4",
        });
        appbox.load().then(() => {
            appbox.show();
        });
    },

    // 激励视频广告
    AD_reward: function () {
        videoAd.onError(function (res) {
            console.log("videoAd onError", res);
        });
        videoAd.onLoad(function (res) {
            console.log("videoAd onLoad", res);
        });
        videoAd.onClose(function (res) {
            console.log("videoAd onClose", res);
        });
        videoAd
            .load()
            .then(() => {
                console.log("激励视频加载成功");
                videoAd
                    .show()
                    .then(() => {
                        console.log("激励视频 广告显示成功");
                    })
                    .catch((err) => {
                        console.log("激励视频 广告显示失败");
                    });
            })
            .catch((err) => {
                console.log("激励视频加载失败");
            });
    },
});
