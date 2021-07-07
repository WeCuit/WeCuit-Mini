// pages/my/sub/sub.js
const app = getApp();
import { genQuerySign } from "../../../utils/tool";

Page({
    /**
     * 页面的初始数据
     */
    data: {
        tplList: [
            {
                tplId: "1",
                templateId: "ntDQ6-GCdTqbYCtqigSc7ZzK7rvyH1bfD_5wtcVgPWo",
                type: "wx",
                description: "\u671f\u672b\u6210\u7ee9\u66f4\u65b0\u63d0\u9192",
                subCnt: 0,
            },
            {
                tplId: "2",
                templateId: "VOXuOsX_vQLFI2Ph5w0Q9qG_7X5VE5bntcN3H6RSvUM",
                type: "wx",
                description: "\u6253\u5361\u63d0\u9192",
                subCnt: 0,
            },
        ],
        delBtnDisabled: true,
        delBtnLoading: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getTemplateIdList().then(() => {
            this.getSubStatus();
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
    onUnload: function () {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.getSubStatus();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {},
    getTemplateIdList: function () {
        wx.showLoading({ title: "获取订阅列表~" });
        return app
            .httpGet({
                url: "/Sub/getTemplateIdList",
            })
            .then((data) => {
                wx.hideLoading();
                this.setData({
                    tplList: data.data,
                });
            })
            .catch((err) => {
                wx.showToast({
                    icon: "none",
                    title: err.errMsg ? err.errMsg : "未知异常",
                });
            });
    },
    changeSubStatus: function (e) {
        const index = e.currentTarget.dataset.index;
        const value = e.detail.value;
        this.data.tplList[index].status = value;
        console.log(e);
        this.showConfirm(value)
            .then(() => {
                wx.showLoading({ title: "请求中~" });
                app.httpPost({
                    url: "/Sub/changeStatusV2",
                    data: {
                        openid: app.globalData.openid,
                        status: value,
                        tplId: this.data.tplList[index].tplId,
                        userId: app.globalData.accountInfo.userId,
                        userPass: app.RSAEncrypt(
                            app.globalData.accountInfo.userPass
                        ),
                        sign: genQuerySign(
                            "/Sub/changeStatusV2/",
                            app.globalData.openid,
                            this.data.tplList[index].tplId
                        ),
                    },
                })
                    .then((data) => {
                        wx.showToast({
                            title: data.errMsg,
                        });
                        if (value && this.data.delBtnDisabled) {
                            this.setData({
                                delBtnDisabled: false,
                            });
                        }
                        this.setData({
                            tplList: this.data.tplList,
                        });
                    })
                    .catch((err) => {
                        wx.showToast({
                            icon: "none",
                            title: err.errMsg ? err.errMsg : "未知异常",
                        });
                        this.data.tplList[index].status = false;
                        this.setData({
                            tplList: this.data.tplList,
                        });
                    })
            })
            .catch(() => {
                this.data.tplList[index].status = !value;
                this.setData({
                    tplList: this.data.tplList,
                });
            });
    },
    // 获取订阅状态
    getSubStatus: function () {
        wx.showLoading({ title: "获取订阅信息~" });
        app.httpPost({
            url: "/Sub/getStatusV2",
            data: {
                openid: app.globalData.openid,
                sign: genQuerySign("/Sub/getStatusV2/", app.globalData.openid),
            },
        })
            .then((data) => {
                wx.hideLoading();
                wx.stopPullDownRefresh();
                var sub = data.sub;
                var delBtnDisabled = this.data.delBtnDisabled;
                for (var i = 0; i < sub.length; i++) {
                    for (var j = 0; j < this.data.tplList.length; j++) {
                        if (this.data.tplList[j].tplId === sub[i].tplId) {
                            this.data.tplList[j].subCnt = parseInt(
                                sub[i].subCnt
                            );
                            this.data.tplList[j].status = sub[i].status;
                            delBtnDisabled = !this.data.tplList[j].status;
                        }
                    }
                }
                if (delBtnDisabled !== this.data.delBtnDisabled) {
                    this.setData({
                        delBtnDisabled: delBtnDisabled,
                    });
                }
                this.setData({
                    tplList: this.data.tplList,
                });
            })
            .catch((err) => {
                wx.hideLoading();
                wx.stopPullDownRefresh();
                wx.showToast({
                    icon: "none",
                    title: err.errMsg ? err.errMsg : "未知异常",
                });
            });
    },
    showConfirm: function (isShow) {
        return new Promise((resolve, reject) => {
            if (isShow)
                wx.showModal({
                    title: "订阅提示",
                    content: "订阅消息将加密上传学号密码",
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
            else resolve();
        });
    },
    addSubCnt: function (e) {
        console.log(e);
        const index = e.currentTarget.dataset.index;
        if (true !== this.data.tplList[index].status) {
            wx.showToast({
                icon: "none",
                title: "暂未开启订阅！",
            });
            return;
        }
        new Promise((resolve, reject) => {
            // QQ微信订阅
            if (wx.requestSubscribeMessage) {
                wx.requestSubscribeMessage({
                    tmplIds: [this.data.tplList[index].templateId],
                    success: (res) => {
                        if (
                            "accept" ===
                            res[this.data.tplList[index].templateId]
                        ) {
                            resolve(true); // 添加
                        } else {
                            reject({
                                errMsg:
                                    res[this.data.tplList[index].templateId],
                            });
                        }
                    },
                    fail: (err) => {
                        reject(err);
                    },
                });
            } else if (qq.subscribeAppMsg) {
                // 一次性订阅
                qq.subscribeAppMsg({
                    tmplIds: [this.data.tplList[index].templateId],
                    subscribe: true,
                    success: (res) => {
                        if (
                            "accept" ===
                            res[this.data.tplList[index].templateId]
                        ) {
                            resolve(true);
                        } else {
                            reject({
                                errMsg:
                                    res[this.data.tplList[index].templateId],
                            });
                        }
                    },
                    fail(res) {
                        console.log("----subscribeAppMsg----fail", res);
                    },
                });
            }
        })
            .then((res) => {
                wx.showLoading({ title: "请求中~" });
                app.httpPost({
                    url: "/Sub/addCntV2",
                    data: {
                        openid: app.globalData.openid,
                        tplId: this.data.tplList[index].tplId,
                        sign: genQuerySign(
                            "/Sub/addCntV2/",
                            app.globalData.openid,
                            this.data.tplList[index].tplId
                        ),
                    },
                })
                    .then((data) => {
                        wx.showToast({ title: data.errMsg });
                        this.data.tplList[index].subCnt = this.data.tplList[
                            index
                        ].subCnt
                            ? this.data.tplList[index].subCnt + 1
                            : 1;
                        this.setData({
                            tplList: this.data.tplList,
                        });
                    })
                    .catch((err) => {
                        wx.showToast({
                            icon: "none",
                            title: err.errMsg ? err.errMsg : "未知异常",
                        });
                    });
            })
            .catch((err) => {
                console.log(err);
            });
    },
    bindDelSub: function () {
        this.setData({ delBtnLoading: true });
        let _that = this
        app.httpPost({
            url: "/Sub/deleteV2",
            data: {
                openid: app.globalData.openid,
                sign: genQuerySign("/Sub/deleteV2/", app.globalData.openid),
            },
        })
            .then((data) => {
                _that.setData({ delBtnLoading: false });
                wx.showToast({
                    title: "删除成功",
                });
                for (var i = 0; i < this.data.tplList.length; i++) {
                    this.data.tplList[i].status = false;
                    this.data.tplList[i].subCnt = 0;
                }
                this.setData({
                    tplList: this.data.tplList,
                    delBtnDisabled: true,
                });
            })
            .catch((err) => {
                _that.setData({ delBtnLoading: false });
                if ("undefined" != typeof err.errMsg) {
                    wx.showToast({
                        icon: "none",
                        title: err.errMsg,
                    });
                } else {
                    wx.showToast({
                        icon: "none",
                        title: "未知错误",
                    });
                }
            });
    },
});
