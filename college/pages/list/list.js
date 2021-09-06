// pages/computerCenter/index.js

Page({
    /**
     * 页面的初始数据
     */
    data: {
        menuList_lq: [
            {
                path: "../menu/menu?college=gl",
                size: 22,
                color: "rgb(0,255,255)",
                action: "bindAction",
                img: "gl.jpg",
                text: "管理学院",
            },
            {
                path: "../menu/menu?college=tj",
                size: 23,
                color: "rgb(0,255,255)",
                action: "bindAction",
                img: "tj.jpg",
                text: "统计学院",
            },
            {
                path: "../menu/menu?college=whys",
                size: 25,
                color: "rgb(0,255,255)",
                action: "bindAction",
                img: "whys.jpg",
                text: "文化艺术",
            },
            {
                path: "../menu/menu?college=wl",
                size: 23,
                color: "rgb(0,255,255)",
                action: "bindAction",
                img: "wl.jpg",
                text: "物流学院",
            },
        ],
        menuList_hk: [
            {
                path: "../menu/menu?college=dqkx",
                size: 25,
                color: "rgb(0,255,255)",
                action: "bindAction",
                img: "dqkx.jpg",
                text: "大气科学",
            },
            {
                path: "../menu/menu?college=dzgc",
                size: 25,
                color: "rgb(0,255,255)",
                action: "bindAction",
                img: "dzgc.jpg",
                text: "电子工程",
            },
            {
                path: "../menu/menu?college=gdgc",
                size: 25,
                color: "rgb(0,255,255)",
                action: "bindAction",
                img: "gdgc.jpg",
                text: "光电工程",
            },
            {
                path: "../menu/menu?college=compute",
                size: 24,
                color: "rgb(0,255,255)",
                action: "bindAction",
                img: "jsj.jpg",
                text: "计算机",
            },
            {
                path: "../menu/menu?college=kzgc",
                size: 25,
                color: "rgb(0,255,255)",
                action: "bindAction",
                img: "kzgc.jpg",
                text: "控制工程",
            },
            {
                path: "../menu/menu?college=rjgc",
                size: 25,
                color: "rgb(0,255,255)",
                action: "bindAction",
                img: "rjgc.jpg",
                text: "软件工程",
            },
            {
                path: "../menu/menu?college=txgc",
                size: 25,
                color: "rgb(0,255,255)",
                action: "bindAction",
                img: "txgc.jpg",
                text: "通信工程",
            },
            {
                path: "../menu/menu?college=wgy",
                size: 23,
                color: "rgb(0,255,255)",
                action: "bindAction",
                img: "wgy.jpg",
                text: "外国语",
            },
            {
                path: "../menu/menu?college=wlaq",
                size: 23,
                color: "rgb(0,255,255)",
                action: "bindAction",
                img: "wlkjaq.jpg",
                text: "网安",
            },
            {
                path: "../menu/menu?college=yysx",
                size: 25,
                color: "rgb(0,255,255)",
                action: "bindAction",
                img: "yysx.jpg",
                text: "应用数学",
            },
            {
                path: "../menu/menu?college=zyhj",
                size: 25,
                color: "rgb(0,255,255)",
                action: "bindAction",
                img: "zyhj.jpg",
                text: "资源环境",
            },
            {
                path: "../menu/menu?college=qkl",
                size: 25,
                color: "rgb(0,255,255)",
                action: "bindAction",
                img: "qkl.jpg",
                text: "区块链",
            },
            // {
            //     path: "../menu/menu?college=compute",
            //     size: 25,
            //     color: "rgb(0,255,255)",
            //     action: "bindAction",
            //     icon: "icon-tongzhi",
            //     text: "马克思主义学院",
            // },
        ],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {},

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
    onPullDownRefresh: function () {},

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
            title: '教学部门',
            query: "",
        };
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '教学部门',
            // for wechat
            path: "/college/pages/list/list",
            // for qq
            query: "",
        };
    },
    bindAction: function (e) {
        var data = e.currentTarget.dataset;
        console.log(data)
        if(data.needlogin && !app.globalData.isUser)
        {
            wx.showToast({
                title: '需要登录',
                icon: "none"
            })
            return;
        }
        wx.navigateTo({
            url: data.path,
            fail: function (res) {
                console.log(res)
                wx.showToast({
                    title: "该功能暂未开发",
                    icon: "none",
                });
            },
        });
    },
});
