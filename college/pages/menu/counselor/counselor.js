// college/pages/menu/counselor/counselor.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    college: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options', options)
    this.data.college = options.college;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getCounselorList(this.data.college);
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
    this.getCounselorList(this.data.college);
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

  /**
   * 拉取辅导员列表
   */
  getCounselorList: function(college){
    app.httpGet({
      url: "/college/getCounselorList/college/" + college
    }).then(data=>{
      this.setData({
        list: data.list
      })
    })
  },

  bindViewCounselor: function(e){
    console.log(e)
    let data = e.currentTarget.dataset
    // 无辅导员
    if("false" === data.id)
    {
      wx.showToast({
        icon: "none",
        title: "无效操作！"
      })
    }else{
      let query = 'link=' + app.globalData.API_DOMAIN + '/college/getCounselorInfo/id/' + data.id
      wx.navigateTo({
        url: '/pages/articleView/articleView?' + query
      })
    }
  }
})