// pages/calendar/calendar.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    calendarImg: 'https://jwc.cuit.edu.cn/xl2020-2021.jpg',
    lqImg: 'https://cuit.api.jysafe.cn/public/images/map/lq.jpg',
    hkgImg: ['https://cuit.api.jysafe.cn/public/images/map/hkg1.jpg', 'https://cuit.api.jysafe.cn/public/images/map/hkg.jpg'],
    listData:[
      {"code":"教学时间","text":"开始时间","type":"结束时间"},
      {"code":"寒假","text":"开始时间","type":"结束时间"},
      ],
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
    if("undefined" !== typeof qq && 1 === getCurrentPages().length)
    {
      this.setData({
        fromShare: true
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
   * 分享至微信朋友圈
   */
  onShareTimeline: function(e){
    // console.log(e)
    return {
      title: '成信大校历',
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '成信大校历',
      // for wechat
      path: '/pages/calendar/calendar',
      // for qq
      query: '',
    }
  },

  /**
   * 获取校历
   */
  getCalendar: function()
  {
    // wx.request({
    //   url: app.globalData.API_DOMAIN + '/wx/static/calendar.png',
    //   header:{
    //     'X-FROM': 'wechat'
    //   }
    // })
  },
  /**
   * 点击图片触发事件
   */
  bindPreview: function(e){
    var url = e.target.dataset.src
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: url
       // 需要预览的图片http链接列表
    })
  },
})