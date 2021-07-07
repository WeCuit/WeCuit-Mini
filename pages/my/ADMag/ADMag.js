// pages/my/dataMag/dataMag.js
const app = getApp();

var videoAd = null;

Page({
    /**
     * 页面的初始数据
     */
    data: {
        isADClose: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            isADClose: app.globalData.isADClose
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        videoAd = wx.createRewardedVideoAd({
            adUnitId: "bb4d8c56d8a3852de532e389f329f10a",
        });
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
    onPullDownRefresh: function () {},

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {},
    openAD: function(){
        this.showConfirm("阁下确定要打开广告吗？").then(()=>{
            app.globalData.isADClose = false
            wx.setStorage({
                key: 'isADClose',
                data: false,
                success: res => {
                    console.log(res)
                    wx.showModal({
                        title: "提示",
                        content: '不出意外，广告已经打开~',
                        showCancel: false,
                    })
                }
            })
            this.setData({
                isADClose: false
            })
        })
    },
    closeAD: function(){
        this.showConfirm("需观看视频广告才可关闭广告").then(()=>{
            videoAd.onClose(res => {
                console.log("videoAd onClose", res);
                if(res.isEnded){
                    app.globalData.isADClose = res.isEnded
                    wx.setStorage({
                        key: 'isADClose',
                        data: true,
                        success: res => {
                            console.log(res)
                            wx.showModal({
                                title: "提示",
                                content: '不出意外，广告已经关闭~',
                                showCancel: false,
                            })
                        }
                    })
                    this.setData({
                        isADClose: true
                    })
                }else{
                    wx.showModal({
                        title: "提示",
                        content: '未看完，关闭广告失败~',
                        showCancel: false,
                    })
                }
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
        })
    },
    showConfirm: function (text) {
        return new Promise((resolve, reject) => {
            wx.showModal({
                title: "提示",
                content: text,
                confirmColor: "black",
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
});
