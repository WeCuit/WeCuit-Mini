// pages/articleView/articleView.js
const app = getApp()
var downloadTask = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    htmlText: "少女祈祷中~",
    
    source: '',
    domain: '',
    path: '',
    link: '',
    title: '',

    captchaHidden: true,
    downloadHidden: true,
    captchaImg: '',
    cookie: '',
    fromShare: false,
    isADClose: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /**
     * @source
     * @domain
     * @path
     * 
     * @link
     * 
     */

    console.log('articleView', options)
    this.setData({
      isADClose: app.globalData.isADClose
    })
    if("undefined" !== typeof options.link)
    {
      this.data.source = 'html'
      this.data.link = options.link;
      this.loadLink(options.link);
      return;
    }
    
    this.data.source = options.source
    this.data.domain = options.domain
    this.data.path = -1 != options.path.indexOf('?')?encodeURIComponent(options.path):options.path
    
    if(0 === this.data.path.indexOf('%2F'))
      this.data.link = 'http://' + this.data.domain + this.data.path;
    else
      this.data.link = 'http://' + this.data.domain + '/' + this.data.path;
    this.loadContent(this.data.path, this.data.source)
  },
  loadContent: function(data, source)
  {
    switch (source) {
      case 'html':
        this.loadLink(data);
        break;
      default:
        var url = app.globalData.API_DOMAIN + '/News/getContent/source/' + source + '?link=' + this.data.link;
        this.loadLink(url);
        break;
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.showShareMenu({
      withShareTicket: true,
      // for wx
      menus: ['shareAppMessage', 'shareTimeline'],
      // for qq
      showShareItems: ['qq', 'qzone', 'wechatFriends', 'wechatMoment']
    })
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
    this.loadContent(this.data.link, this.data.source)
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
      title: this.data.title,
      query: 'source=' + this.data.source + '&path=' + this.data.path + '&domain=' + this.data.domain,
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.title,
      // for wechat
      path: '/pages/articleView/articleView?source=' + this.data.source + '&path=' + this.data.path + '&domain=' + this.data.domain,
      // for qq
      query: 'source=' + this.data.source + '&path=' + this.data.path + '&domain=' + this.data.domain,
    }
  },

  /**
   * 加载普通html页面
   * @param {*} link 
   */
  loadLink: function(url)
  {
    wx.request({
      url: url,
      dataType: 'String',
      success: res=>{
        this.setData({
          htmlText: res.data
        })
        var title = res.data.match(/<title>(.*?)<\/title>/i)
        if(title)
          this.data.title = title[1]
      },
      complete: res=>{
        wx.stopPullDownRefresh()
      }
    })
  },

  // html链接处理
  bindLinkHandle: function(e)
  {
    if(-1 != e.detail.href.search(/.pdf|.docx|.doc|.xlsx|.xls|.zip|.rar/i))
    {
      // 带有指定后缀，此类链接不进行自动跳转/复制操作
      e.detail.ignore();

      wx.showToast({
        icon: 'loading',
        title: '正在下载文件',
      })
      if(0 != e.detail.href.indexOf('http') && 0 != e.detail.href.indexOf('/'))e.detail.href = '/' + e.detail.href;
      let type = e.detail.href.substr(e.detail.href.lastIndexOf('.') + 1);
      wx.downloadFile({
        url: app.globalData.API_DOMAIN + '/File/transferV2/type.' + type + '?link=' + encodeURIComponent(e.detail.href) + '&page=' + this.data.link,
        success: function (res) {
          if(200 != res.statusCode)
          {
            wx.showToast({
              icon: 'none',
              title: parseInt(res.statusCode).toString(),
            })
            return;
          }
          wx.showToast({
            icon: 'success',
            title: '正在打开文件',
          })
          const filePath = res.tempFilePath
          wx.openDocument({
            filePath: filePath,
            showMenu: true,
            fail: function (err) {
              console.log(err)
              wx.showToast({
                icon: 'none',
                title: '打开失败',
              })
            }
          })
        },
        fail(err){
          wx.showToast({
            icon:'none',
            title: err.errMsg,
          })
        }
      })
    }else if(-1 != e.detail.href.search(/system\/_content\/download.jsp/i))
    {
      // 此类链接不进行自动跳转/复制
      e.detail.ignore();

      this.data.downLink = e.detail.href
      this.checkDownLink(e.detail.href, '')
    }
  },
  checkDownLink: function(link, codeValue)
  {
    wx.showLoading({
      title: '正在尝试下载',
    })
    app.httpPost({
      url: '/News/downFile',
      data: {
        cookie: this.data.cookie,
        downUrl: link,
        codeValue: codeValue,
        domain: this.data.domain
      },
    }).then(data=>{
      wx.hideLoading()
      if(!this.data.captchaHidden)this.setData({captchaHidden: true})
      // 可下载
      this.downFile(data.link)
    }).catch(err=>{
      wx.hideLoading()
      if(2002 == data.errorCode)
      {
        // 需验证码
        this.setData({
          captchaImg: 'data:image/png;base64,' + data.captcha,
          captchaHidden: false
        })
        this.data.cookie = data.cookie
      }else{
        // 其它错误
        wx.showToast({
          icon: 'none',
          title: data.errMsg,
        })
      }
    })
  },
  downFile: function(link){
    wx.showLoading({
      title: '正在下载',
    })
    downloadTask = wx.downloadFile({
      url: link,
      success: (res)=>{
        wx.showToast({
          icon:'loading',
          title: '尝试打开',
        })
        wx.openDocument({
          filePath: res.tempFilePath,
        })
      },
      fail: (err)=>{
        console.log(err)
      },
      complete:(res)=>{
        this.setData({downloadHidden: true})
      }
    })
    downloadTask.onProgressUpdate((p)=>{
      wx.hideLoading()
      // wx.showLoading({
      //   title: p.progress + "%\r\n" + parseInt(p.totalBytesWritten / 1024) + '/' + parseInt(p.totalBytesExpectedToWrite / 1024) + 'KB',
      // })
      // console.log("pls stop")
      this.setData({
        downloadHidden: false,
        progress:p.progress + '%\r\n' + parseInt(p.totalBytesWritten / 1024) + '/' + parseInt(p.totalBytesExpectedToWrite / 1024) + 'KB'
      })
    })
  },

  // 提交验证码下载
  downByYZM: function()
  {
    this.checkDownLink(this.data.downLink, this.data.codeValue)
  },

  // 取消下载
  downCancel: function()
  {
    this.setData({captchaHidden:true})
  },
  // 输入验证码
  bindInputYZM: function(e)
  {
    this.data.codeValue = e.detail.value
  },
  // 刷新验证码
  refreshCaptcha: function () {
  },

  // 取消下载
  downloadCancel:function()
  {
    this.setData({
      downloadHidden: true,
    })
    downloadTask.abort()
  },
})