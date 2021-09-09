const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      var isQQ = false;
      if("undefined" != typeof qq)
        isQQ = true
      this.setData({
        isQQ: isQQ
      })
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
      if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
        this.getTabBar().setData({
          selected: 2
        })
      }
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
    // 点击事件
    bindGroup: function(){
      wx.showModal({
        title: '将复制以下内容',
        content: app.globalData.config.group,
        success (res) {
          if (res.confirm) {
            wx.setClipboardData({
              data: app.globalData.config.group,
            })
          } else if (res.cancel) {
          }
        }
      })
    },
    bindOpen: function(){
      wx.showModal({
        title: '将复制以下内容',
        content: app.globalData.config.github,
        success (res) {
          if (res.confirm) {
            wx.setClipboardData({
              data: app.globalData.config.github,
            })
          } else if (res.cancel) {
          }
        }
      })
    },
    bindThanks: function()
    {
      wx.navigateTo({
        url: '/pages/articleView/articleView?link=' + app.globalData.API_DOMAIN + '/Sys/about'
      })
    },
    bindLogout: function(){
      wx.removeStorageSync('TWFID')
      wx.removeStorageSync('SSO_TGC')
      wx.removeStorageSync('JWGL_cookie')
      wx.removeStorageSync('SSO_TGC')
      wx.showToast({
        title: '登录凭据清除完毕',
      })
    }
  
  })