// pages/laboratory/list.js
const app = getApp();

Page({
    /**
     * 页面的初始数据
     */
    data: {
        notice: "",
        cxMc: "",
        cxFjh: "",
        cxJxb: "",
        cxJs: "",
        cxKc: "",

        cxZt: [
            {
                id: "0",
                text: "无时间限制",
            },
            {
                id: "8",
                text: "未结束授课",
            },
            {
                id: "9",
                text: "授课已结束",
            },
            {
                id: "A",
                text: "指定周次有课",
            },
            {
                id: "1",
                text: "今天有课",
            },
            {
                id: "2",
                text: "明天有课",
            },
            {
                id: "3",
                text: "后天有课",
            },
            {
                id: "4",
                text: "第4天有课",
            },
            {
                id: "5",
                text: "第5天有课",
            },
            {
                id: "6",
                text: "第6天有课",
            },
            {
                id: "7",
                text: "第7天有课",
            },
        ],
        cxZt_index: 0,
        cxZc: "",
        cxLb: [
            {
                id: "1",
                text: "实践教学",
            },
            {
                id: "5",
                text: "开放实验室",
            },
            {
                id: "6",
                text: "教师值班",
            },
        ],
        cxLb_index: 0,
        cxXsms: [
            {
                id: "J",
                text: "简表",
            },
            {
                id: "X",
                text: "详表",
            },
        ],
        cxXsms_index: 0,
        hideData: {},
        heightData:[],
        retList: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showShareMenu({
            withShareTicket: true,
            // for wx
            menus: ["shareAppMessage", "shareTimeline"],
            // for qq
            showShareItems: ["qq", "qzone", "wechatFriends", "wechatMoment"],
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        if("undefined" !== typeof qq && 1 === getCurrentPages().length)
        {
          this.setData({
            fromShare: true
          })
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.doSubmit2();
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
        let data = {
            cxMc: this.data.cxMc,
            cxFjh: this.data.cxFjh,
            cxJxb: this.data.cxJxb,
            cxJs: this.data.cxJs,
            cxKc: this.data.cxKc,
            cxZt: this.data.cxZt[this.data.cxZt_index].id,
            cxZc: this.data.cxZc,
            cxLb: this.data.cxLb[this.data.cxLb_index].id,
            cxXsms: this.data.cxXsms[this.data.cxXsms_index].id,
        };
        let url = this.getUrlByParam(data);
        return {
            title: "实验安排表-We成信大",
            query: url,
        };
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        let data = {
            cxMc: this.data.cxMc,
            cxFjh: this.data.cxFjh,
            cxJxb: this.data.cxJxb,
            cxJs: this.data.cxJs,
            cxKc: this.data.cxKc,
            cxZt: this.data.cxZt[this.data.cxZt_index].id,
            cxZc: this.data.cxZc,
            cxLb: this.data.cxLb[this.data.cxLb_index].id,
            cxXsms: this.data.cxXsms[this.data.cxXsms_index].id,
        };
        let url = this.getUrlByParam(data);
        return {
            title: "实验安排表-We成信大",
            // for wechat
            path: "/pages/laboratory/list?" + url,
            // for qq
            query: url,
        };
    },

    showNotice: function (e) {
        if (this.data.noticeTimeout) clearTimeout(this.data.noticeTimeout);
        this.setData({
            notice: e.currentTarget.dataset.title,
            isShowNotice: true,
        });
    },
    hideNotice: function (e) {
        console.log(e);
        this.data.noticeTimeout = setTimeout(() => {
            this.setData({
                isShowNotice: false,
            });
        }, 500);
    },
    hideAni: function (e) {
        // console.log(e);
        let eleId = e.currentTarget.dataset.ele;
        this.data.hideData["ele_" + eleId] = !Boolean(
            this.data.hideData["ele_" + eleId]
        );
        this.setData({
            hideData: this.data.hideData,
        });
    },
    calAniHeight: function(){
        let query = wx.createSelectorQuery();
        for (let i = 0; i <= this.data.retList.length; i++) {
            query.select(`#card-body-${i}`).boundingClientRect();
        }
        query.exec(ret => {
            console.log(ret);
            ret.forEach((v, i)=>{
                this.data.heightData[i] = v.height + 'px';
            })
            this.setData({
                heightData: this.data.heightData
            })
        })
    },
    bindinput: function (e) {
        // 微信端使用双向绑定更佳
        // console.log(e);
        let data = e.currentTarget.dataset;
        this.data[data.name] = e.detail.value;
    },
    doSubmit: function (e) {
        let data = e.detail.value;
        data.cxLb = this.data.cxLb[data.cxLb].id;
        data.cxXsms = this.data.cxXsms[data.cxXsms].id;
        data.cxZt = this.data.cxZt[data.cxZt].id;
        this.requestForList(data);
    },
    doSubmit2: function () {
        let data = {
            cxMc: this.data.cxMc,
            cxFjh: this.data.cxFjh,
            cxJxb: this.data.cxJxb,
            cxJs: this.data.cxJs,
            cxKc: this.data.cxKc,
            cxZt: this.data.cxZt[this.data.cxZt_index].id,
            cxZc: this.data.cxZc,
            cxLb: this.data.cxLb[this.data.cxLb_index].id,
            cxXsms: this.data.cxXsms[this.data.cxXsms_index].id,
        };
        this.requestForList(data);
    },
    getUrlByParam: function (param) {
        var url = "";
        for (field in param) {
            url += "&" + field + "=" + param[field];
        }
        return url == "" ? url : url.substring(1);
    },
    requestForList: function (param) {
        app.httpGet({
            url: "/Jwc/labAll",
            data: param,
        }).then((res) => {
            console.log(res);
            this.setData({
                retList: res.data.list,
            });
            this.setData(res.data.form);
            this.calAniHeight();
        });
    },
});
