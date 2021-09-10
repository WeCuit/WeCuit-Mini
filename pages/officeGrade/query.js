// pages/computerCenter/officeGrade/query.js
import { getOfficePrepare, getOfficeCaptcha, officeQuery } from './api'

const app = getApp()
let office;

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
    office.prepareQuery().then((res) => {
      const resp = res.data
      this.data.cookie = resp.data.cookie
      this.data.codeKey = resp.data.codeKey
      this.setData({
        syncTime: resp.data.syncTime
      })
      office.getCaptcha(this.data.cookie, this.data.codeKey).then((res) => {
        const resp = res.data

        this.setData({
          captchaImg: resp.data.base64img,
          captchaCode: resp.data.imgCode
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
  refreshCaptcha: function () {
    office.getCaptcha(this.data.cookie, this.data.codeKey).then((res) => {
      const resp = res.data
      this.setData({
        captchaImg: resp.data.base64img,
        captchaCode: resp.data.imgCode
      })
    })
  },
  formSubmit: function (e) {
    let data = e.detail.value
    data.codeKey = this.data.codeKey
    data.cookie = this.data.cookie
    console.log(data)
    office.query(data).then((res) => {
      const resp = res.data
      this.setData({
        result: resp.data.result
      })
      this.refreshCaptcha()
    })
  }
})
class OFFICE {
  constructor(api) {
    this.API = api
  }
  prepareQuery() {
    return getOfficePrepare()
  }
  getCaptcha(cookie, codeKey) {
    console.log(cookie, codeKey)
    return getOfficeCaptcha({
      cookie: cookie,
      codeKey: codeKey
    })
  }
  query(e) {
    return officeQuery(e)
  }
}