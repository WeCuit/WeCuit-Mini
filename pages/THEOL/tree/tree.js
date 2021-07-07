// pages/THEOL/dir/dir.js
const app = getApp();

Page({
    /**
     * 页面的初始数据
     */
    data: {
      treeData: {
        text: '列表加载中~',
        id: 0
      },
        lid: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.data.courseId = options.courseId;
      console.log(options)
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
      this.getDirTree(this.data.courseId)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {},
    tapDirItem: function (e) {
      console.log(e)
      wx.navigateTo({
        url: '../dir/dir?lid=' + this.data.courseId + '&folderId=' + e.detail.itemid
      })
    },
    getDirTree: function(lid){
      wx.request({
        url: app.globalData.API_DOMAIN + '/Theol/dirTree?lid=' + lid,
        success: res=>{
          var data = res.data;
          if(2000 == data.status){
            this.setData({
              treeData: data.dir
            })
          }else{
            wx.showToast({
              icon: 'none',
              title: data.errMsg
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
    },

});
