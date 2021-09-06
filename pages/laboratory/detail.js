// pages/laboratory/detail.js
const app = getApp();

Page({
    /**
     * 页面的初始数据
     */
    data: {
        notice: "",
        Yx: [
            {
                id: "0",
                text: "不限院系",
            },
        ],
        Yx_index: 0,
        Rw: [
            {
                id: "1",
                text: "承担任务",
            },
            {
                id: "2",
                text: "负责课程",
            },
            {
                id: "3",
                text: "聘用教师",
            },
            {
                id: "4",
                text: "所管班级",
            },
        ],
        Rw_index: 0,
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
        Lb: [
            {
                id: "A",
                text: "理论教学",
            },
            {
                id: "1",
                text: "实践教学",
            },
            {
                id: "B",
                text: "实践教学-计划外",
            },
            {
                id: "9",
                text: "理论与实践教学",
            },
            {
                id: "5",
                text: "开放实验室",
            },
            {
                id: "6",
                text: "教师值班",
            },
            {
                id: "8",
                text: "学生值班",
            },
        ],
        Lb_index: 0,
        hideData: {},
        heightData: {},
        retList: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        this.data.options = options;

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
        this.requestForDetail(this.data.options);
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
        let data = this.getFormData();
        let search = this.getUrlByParam(data);
        return {
            title: "实验安排表-We成信大",
            query: search,
        };
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        let data = this.getFormData();
        let search = this.getUrlByParam(data);
        return {
            title: "实验安排表-We成信大",
            // for wechat
            path: `/pages/laboratory/detail?${search}`,
            // for qq
            query: search,
        };
    },
    getFormData: function(){
        return {
            Kkxq: this.data.Kkxq,
            Yx: this.data.Yx[this.data.Yx_index].id,
            Rw: this.data.Rw[this.data.Rw_index].id,
            Sys: this.data.Sys,
            Fj: this.data.Fj,
            Jxb: this.data.Jxb,
            Zjjs: this.data.Zjjs,
            Jxkc: this.data.Jxkc,
            cxZt: this.data.cxZt[this.data.cxZt_index].id,
            cxZc: this.data.cxZc,
            Lb: this.data.Lb[this.data.Lb_index].id,
        };
    },
    requestForDetail: function (param) {
        app.httpGet({
            url: "/Jwc/labDetail",
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
    calAniHeight: function(){
        console.log("calAniHeight");
        let query = wx.createSelectorQuery();
        query.select(`#card-body-0`).boundingClientRect();
        for(let key in this.data.retList){
            query.select(`#card-body-${1+key}`).boundingClientRect();
        }
        console.log("calAniHeight1");
        query.exec(ret => {
            if(null == ret)return;
            ret.forEach((v, i)=>{
                this.data.heightData[v.id] = v.height + 'px';
            })
            this.setData({
                heightData: this.data.heightData
            })
        })
    },
    hideAni: function (e) {
        console.log(e);
        let eleId = e.currentTarget.dataset.ele;
        this.data.hideData["ele_" + eleId] = !Boolean(
            this.data.hideData["ele_" + eleId]
        );
        this.setData({
            hideData: this.data.hideData,
        });
    },
    doSubmit: function (e) {
        let data = e.detail.value;
        data.Yx = this.data.Yx[data.Yx].id;
        data.Rw = this.data.Rw[data.Rw].id;
        data.cxZt = this.data.cxZt[data.cxZt].id;
        data.Lb = this.data.Lb[data.Lb].id;
        console.log(data);
        this.requestForDetail(data);
    },
    doSubmit2: function () {
        let data = this.getFormData();
        this.requestForDetail(data);
    },
    getUrlByParam: function (param) {
        var url = "";
        for (field in param) {
            url += "&" + field + "=" + param[field];
        }
        return url == "" ? url : url.substring(1);
    },
    bindinput: function (e) {
        let data = e.currentTarget.dataset;
        this.data[data.name] = e.detail.value;
    },
});
