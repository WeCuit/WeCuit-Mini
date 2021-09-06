// pages/computerCenter/index.js
const app = getApp();

Page({
    /**
     * 页面的初始数据
     */
    data: {
        menuList: [
            {
                data: "introduce",
                size: 30,
                color: "#03a9f4",
                action: "bindAction",
                icon: "icon-jianjie",
                text: "学院简介",
            },
            {
                data: "newsList",
                size: 30,
                color: "#03a9f4",
                action: "bindAction",
                icon: "icon-zixun",
                text: "学院资讯",
            },
            {
                data: "counselor",
                size: 30,
                color: "#03a9f4",
                action: "bindAction",
                icon: "icon-fudaoyuanxinxi",
                text: "辅导员",
            },
            {
                data: "contact",
                size: 30,
                color: "#03a9f4",
                action: "bindAction",
                icon: "icon-zixun",
                text: "联系信息",
            },
        ],
        college: "",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.college = options.college;
        wx.setNavigationBarTitle({
            title: options.name
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
    onPullDownRefresh: function () {},

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {},
    newsAction: function (e) {
        var data = e.currentTarget.dataset;
        wx.navigateTo({
            url: data.data + this.data.college,
            fail: function (res) {
                console.log(res)
                wx.showToast({
                    title: "该功能暂未开发",
                    icon: "none",
                });
            },
        });
    },
    bindAction: function (e) {
        var data = e.currentTarget.dataset;
        console.log(data)
        switch (data.data) {
            case 'introduce':
                var url = '/pages/articleView/articleView?link=' + app.globalData.API_DOMAIN + '/College/introduce/college/' + this.data.college;
                break;
        
            case 'newsList':
                var url = '/pages/newsList/newsList?source=' + this.data.college;
                break;

            case 'counselor':
                var url = 'counselor/counselor?college=' + this.data.college;
                break;
                
            case 'contact':
                var url = '/pages/articleView/articleView?link=' + app.globalData.API_DOMAIN + '/College/contact/college/' + this.data.college;
                break;

            default:
                wx.showToast({
                    title: "未知操作",
                    icon: "none",
                });
                return ;
                break;
        }
        wx.navigateTo({
            url: url,
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
