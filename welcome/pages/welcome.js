// pages/welcome/welcome.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    menuList:[
      {
          data: "admit/admit",
          size: 30,
          color: "#03a9f4",
          action: "bindAction",
          icon: "welcome-ziyuan",
          text: "录取查询",
      },
      {
          data: "guide/index",
          size: 30,
          color: "#03a9f4",
          action: "bindAction",
          icon: "welcome-ditu",
          text: "游览校园",
      }
  ]
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

  bindAction: function (e) {
      var data = e.currentTarget.dataset;
      wx.navigateTo({
          url: data.data,
          fail: function (res) {
              console.log(res)
              wx.showToast({
                  title: "该功能暂未开发",
                  icon: "none",
              });
          },
      });
  },
})