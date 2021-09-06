// pages/exam/exam.js
import {getExamOption, getExamTable} from './api'
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    examList: [],

    batchArray: [
      {
        id: "602",
        name: "期末考试",
      },
    ],
    batchIndex: 0,
    termArray: [
      [
        {
          name: "20??-20??",
        },
      ],
      [
        {
          id: '402',
          name: "第?学期",
        },
      ],
    ],
    termIndex: [0, 0],
    termData: {},
    sessionInfo: {},
    isFirstOpenSSO: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData();
  },
  initData: function () {
    this.data.sessionInfo = app.globalData.sessionInfo;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.globalData.autoLoginProcess.then(() => {
      this.onPullDownRefresh();
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showLoading({ title: "获取学期批次~" });
    this.getExamOption()
      .then((res) => {
        const resp = res.data;
        const data = resp.data;

        wx.hideLoading();
        var tempData = {};
        var sem = data.semesterCalendar;
        tempData["batchArray"] = data.batch;
        tempData["termArray"] = [sem.semesters[0]];
        this.data.termData = sem.semesters[1];
        tempData["termArray"][1] = this.data.termData[sem.yearIndex];
        tempData["termIndex"] = [sem.yearIndex, sem.termIndex]
        this.setData(tempData);
      })
      .catch((err) => {
        wx.hideLoading();
      })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },
  bindPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      batchIndex: e.detail.value,
    });
  },
  bindMultiPickerChange: function (e) {
    // console.log('MultiPicker发送选择改变，携带值为', e.detail.value)
    this.setData({
      termIndex: e.detail.value,
    });
    this.onPullDownRefresh();
  },
  bindMultiPickerColumnChange: function (e) {
    // console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      termArray: this.data.termArray,
      termIndex: this.data.termIndex,
    };
    data.termIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        // 第二列、第三列默认索引值0
        data.termArray[1] = this.data.termData[e.detail.value];
        data.termIndex[1] = 0;
        break;
    }
    // console.log(data.termIndex);
    this.setData(data);
  },
  /**
   * 获取考试选项
   */
  getExamOption: function () {
    const cookie = `semester.id=${this.data.termArray[1][this.data.termIndex[1]].id};${this.data.sessionInfo.JWGL_cookie}; TWFID=${this.data.sessionInfo.TWFID}`
    return getExamOption(cookie);
  },
  /**
   * 考试安排查询请求
   */
  bindExamQuery: function () {
    const cookie = `${this.data.sessionInfo.JWGL_cookie}; TWFID=${this.data.sessionInfo.TWFID}`;
    getExamTable(cookie, this.data.batchArray[this.data.batchIndex].id)
      .then((res) => {
        const resp = res.data;
        this.setData({
          examList: resp.data.examList,
        });
      })
      .catch((err) => {
      })
  },
});
