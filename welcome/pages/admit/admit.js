// pages/welcome/admit/admit.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    result: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.queryHandle(null)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.queryHandle(null)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  queryHandle: function(e){
    var ksh = '', sfz = '';
    if(e){
      var data = e.detail.value;
      ksh = data.ksh;
      sfz = data.sfz
    }
    this.query(ksh, sfz).then(res=>{
      var data = res.data;
      console.log(data)
      if(2000 == data.status){
        this.setData({
          list: data.list,
          result: data.result,
          update: data.update
        })
      }else{
        this.setData({
          result: data.errMsg
        })
      }
    });
  },
  query: function(ksh, sfz){
    return new Promise((resolve, reject)=>{
      wx.request({
        url: app.globalData.API_DOMAIN + '/Admit/query',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          ksh: ksh,
          sfz: sfz
        },
        success: resolve,
        fail: reject
      })
    })
  },
})