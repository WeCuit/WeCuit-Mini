// pages/attendance/edit.js
const app = getApp()
import {genQuerySign} from '../../utils/tool'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    link: '',
    checkInTime: '',
    requestRet: '',
    formData: {},
    autoCheckIn: {
      time: new Date().getHours() + ':' + new Date().getMinutes()
    },
    isAutoCheckIn: false,
    isSubscription: false,
    showIntro: false,
  },
  sessionInfo:{},
  tempForm: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.link = decodeURIComponent(options.link)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    if("undefined" !== typeof qq && 1 === getCurrentPages().length)
    {
      this.setData({
        fromShare: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.sessionInfo = app.globalData.sessionInfo
    app.globalData.autoLoginProcess.then(()=>{
      this.onPullDownRefresh();
    })
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
    // this.getCheckInInfo()
    this.getEditDetail().then(data => {
      wx.stopPullDownRefresh()
      wx.hideLoading()
      this.setData({
        formData: data.form.data,
        checkInTime: data.form.checkTime
      })
      wx.setNavigationBarTitle({
        title: data.form.title,
      })
      return Promise.reject();
    }).catch(err =>{
      if(err && 20401 == err.errorCode){
        // 计算中心未登录
        if (app.globalData.isUser) 
          app.loginClass.ccDoLogin().then(this.onPullDownRefresh);
        else{
          wx.navigateTo({
            url: '../my/sso/sso'
          })
        }
      }else if(err && err.errMsg){
        wx.showToast({
          icon: 'none',
          title: err.errMsg,
        })}
      return Promise.reject();
    })
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
  onFormSubmit: function (e){
    console.log('submit', e);
    var data = e.detail;
    var form = {};

    for(var key in data){
      let type = data[key].original.type;
      switch(type){
        case 'picker':
          let idx = data[key].idx;
          form[key] = data[key].original.range[idx].id;
          break;
        case 'input':
        case 'textarea':
          form[key] = data[key].value;
          break;
      }
    }
    console.log(form);
    this.tempForm = form;

    app.httpPostJson({
      url: '/Jszx/doCheckInV3/',
      data: {
        link: this.data.link,
        JSZXCookie: this.sessionInfo.JSZX_cookie,
        form: form
      }
    }).then(data=>{
      if(2000 == data.errorCode)
      {
        wx.showToast({
          icon: 'none',
          title: data.errMsg
        })
        this.setData({
          formData: data.form.data,
          checkInTime: data.form.checkTime
        })
      }else{
        wx.showToast({
          icon: 'none',
          title: data.errMsg,
        })
      }
    }).catch(err=>{
      wx.showToast({
        icon: 'none',
        title: err.errMsg
      })
    })
  },
  // 获取打卡详细信息
  getEditDetail: function()
  {
    wx.showLoading({
      title: '获取打卡信息',
    })
    return app.httpPost({
      url: '/Jszx/getCheckInEditV2/',
      data: {
        cookie: this.sessionInfo.JSZX_cookie,
        link: this.data.link
      },
    })
  },
  getCheckInInfo: function(){
    app.httpPost({
      url: '/Task/checkInStatusV2',
      data: {
        openid: app.globalData.openid,
        sign: genQuerySign('/Task/checkInStatusV2/', app.globalData.openid)
      },
    }).then(data=>{
      wx.stopPullDownRefresh()
      this.setData({
        isSubscription: data.isSubscription
      })
      if(false !== data.autoCheckIn)
      {
        this.setData({
          autoCheckIn: data.autoCheckIn,
          isAutoCheckIn: true
        })
      }
    }).catch(err=>{
      wx.stopPullDownRefresh()
      if(err.errMsg)
        wx.showToast({
          icon: 'none',
          title: err.errMsg,
        })
    })
  },

  // 监测自动打卡开关
  autoCheckInSwitch:function(e){
    this.data.isAutoCheckIn = e.detail.value
  },

  bindShowIntro: function(){
    this.setData({showIntro:!this.data.showIntro})
  },

  // 更新自动打卡状态
  updateAutoCheckIn:function(){
    if(this.tempForm == null){
      wx.showToast({
        icon: 'none',
        title: '请至少提交一次！'
      })
      return;
    }
    new Promise((resolve, reject)=>{
      if(this.data.isAutoCheckIn)
      {
        this.setData({isAutoCheckIn: true})
        resolve(false)
      }
      else{
        this.setData({isAutoCheckIn: false})
        // 删除
        resolve(true)
      }
    }).then((del)=>{
      //发起网络请求
      if(!del)
      {
        // 添加
        this.addCheckInTask(this.data.autoCheckIn.time, app.globalData.openid, 0)
      }else{
        // 删除
        this.addCheckInTask('06:00', app.globalData.openid, 1)
        let a = this.data.autoCheckIn
        this.setData({autoCheckIn: a})
      }
    }).catch((err)=>{
      console.log(err)
      wx.showToast({
        icon: 'none',
        title: err.errMsg,
      })
    })
  },
  bindAutoCheckInTime:function(e)
  {
    let a = this.data.autoCheckIn
    a.time = e.detail.value
    this.setData({autoCheckIn: a})
  },
  addCheckInTask: function(time, openid, action){
    wx.showLoading({title: '修改中~'})
    var data = {
      time: time,
      openid: openid,
      action: action,
      form: this.tempForm,
      link: this.data.link
    }
    
    let encrypted = app.RSAEncrypt(JSON.stringify(data))

    app.httpPost({
      url: '/Task/checkInInfoV2/',
      data: {
        data: encrypted
      }
    }).then(data=>{
      wx.hideLoading()
      wx.showToast({
            icon: 'none',
            title: data.errMsg,
          })
    }).catch(err=>{
      wx.hideLoading()
      if(err.errMsg)
          wx.showToast({
            icon: 'none',
            title: err.errMsg,
          })
    })
  },
})