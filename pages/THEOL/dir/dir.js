// pages/THEOL/dir/dir.js
const app = getApp();

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
    console.log(options)
    this.data.lid = options.lid;
    this.data.folderId = options.folderId;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.onPullDownRefresh()
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
    this.folderList(this.data.lid, this.data.folderId)
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
  bindViewDir: function(e){
    console.log(e)
    var folderId = e.currentTarget.id;
    wx.navigateTo({
      url: '../dir/dir?lid=' + this.data.lid + '&folderId=' + folderId
    })
  },

  downloadFile: function(e){
    console.log(e)
    var data = e.currentTarget.dataset;
    var query = 'fileId=' + data.fileid + '&resId=' + data.resid + '&lid=' + this.data.lid + '&cookie=' + app.globalData.sessionInfo.theolCookie
    
    wx.showLoading({
      title: '正在尝试下载',
    })
    wx.downloadFile({
      url: app.globalData.API_DOMAIN + '/Theol/downloadFile/1.' + data.suffix + '?' + query,
      success: res=>{
        wx.hideLoading()
        wx.openDocument({
          filePath: res.tempFilePath,
        })
      },
      fail: err=>{
        wx.hideLoading()
      }
    })
  },

  folderList: function(lid, folderId){
    wx.request({
      url: app.globalData.API_DOMAIN + '/Theol/folderList',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data:{
        lid: lid,
        folderId: folderId,
        theolCookie: app.globalData.sessionInfo.theolCookie
      },
      success: res=>{
        var data = res.data;
        if(2000 === data.status){
          this.setData({
            dir: data.dir
          })
        }
      },
      fail: err=>{
          wx.showToast({
              icon: 'none',
              title: '请求失败'
          })
          reject(err)
      }
    })
  }
})