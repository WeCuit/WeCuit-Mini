// pages/computerCenter/officeGrade/query.js
const app = getApp()
var office;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    captchaImg: '',
    cookie: '',
    codeKey: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    office = new OFFICE(app.globalData.API_DOMAIN)
    office.prepareQuery().then((res)=>{
      this.data.cookie = res.cookie
      this.data.codeKey = res.codeKey
      this.setData({
        syncTime: res.syncTime
      })
      office.getCaptcha(this.data.cookie, this.data.codeKey).then((res)=>{
        this.setData({
          captchaImg: res.base64img,
          captchaCode: res.imgCode
        })
      })
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
    console.log('下拉')
    this.onLoad()
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
  refreshCaptcha: function(){
    office.getCaptcha(this.data.cookie, this.data.codeKey).then((res)=>{
      this.setData({
        captchaImg: res.base64img,
        captchaCode: res.imgCode
      })
    })
  },
  formSubmit: function(e){
    let data = e.detail.value
    data.codeKey = this.data.codeKey
    data.cookie = this.data.cookie
    console.log(data)
    office.query(data).then((res)=>{
      this.setData({
        result: res.result
      })
      this.refreshCaptcha()
    })
  }
})
class OFFICE{
  constructor(api){
    this.API = api
  }
  prepareQuery(){
    return app.httpGet({
      url: '/Jszx/office_prepare',
    })
  }
  getCaptcha(cookie, codeKey){
    return app.httpPost({
      url: '/Jszx/office_getCaptcha',
      data: {
        cookie: cookie,
        codeKey: codeKey
      },
    })
  }
  query(e){
    return app.httpPost({
      url: '/Jszx/office_query',
      data: e,
    })
  }
}