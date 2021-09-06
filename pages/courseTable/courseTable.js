const app = getApp()
import {genQuerySign} from '../../utils/tool'

Page({
  data: {
    colorArrays: ["rgba(133,184,207", "rgba(144,198,82", "rgba(216,170,90", "rgba(252,159,157", "rgba(10,154,132", "rgba(97,188,105", "rgba(18,174,243", "rgba(226,154,173"],
    lastX: 0,
    currentGesture: '',
    courseWeekArray: [
        {
            "key": "",
            "name": "全部"
        }
    ],
    termArray: [
        [
          {
            "name": "202?-202?"
          }
        ],
        [
          {
              "id": 0,
              "name": "第?学期"
          }
        ]
      ],
    termIndex: [0, 0],
    termData: {},
    courseTypeArray: [
      {
          "key": "std",
          "name": "学生课表"
      },
      {
          "key": "class",
          "name": "班级课表"
      }
    ],
    courseTypeIndex: 0,
    increment: 0,
    gridOpacity: 1,
    backOpacity: 0.5,
    settingHidden: true,
    background: 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==',
    windowHeight: 500,
    gridHeight: 50,
    sessionInfo: {},
    isFirstOpenSSO: true
  },

  isNotExisted: function (item) {
    if (item == "" || item == null) {
      return true
    }
    return false
  },

  /**
   * 检查是否存在课表数据
   */
  haveData: function () {
    if (
      this.isNotExisted(app.globalData.classtable) ||
      this.isNotExisted(app.globalData.start)
    ) {
      return false
    }
    return true
  },

  onLoad: function (options) {
    this.data.sessionInfo = app.globalData.sessionInfo
    this.data.termData = wx.getStorageSync('termData')
    this.setData({
      courseWeekArray: wx.getStorageSync('courseWeekArray'),
    })
    wx.getStorage({
      key: 'courseTableImg',
      success:(res)=>{
        this.setData({
          background: res.data
        })
      }
    })
    wx.getStorage({
      key: 'backOpacity',
      success:(res)=>{
        this.setData({
          backOpacity: res.data
        })
      }
    })
    wx.getStorage({
      key: 'gridOpacity',
      success:(res)=>{
        this.setData({
          gridOpacity: res.data
        })
      }
    })
    app.globalData.start = wx.getStorageSync('start')
    app.globalData.classtable = wx.getStorageSync('classtable')
    wx.getSystemInfo({
      success: res => {
        this.setData({
          windowHeight: res.windowHeight,
          gridHeight: parseInt((res.windowHeight - 17) / 11 - 1)
        })
      },
      fail(err) {
        console.log(err);
      }
    })
    wx.showShareMenu({
      withShareTicket: true,
      // for wx
      menus: ['shareAppMessage', 'shareTimeline'],
      // for qq
      showShareItems: ['qq', 'qzone', 'wechatFriends', 'wechatMoment']
    })
  },

  onShow: function () {
    this.getOptions()
    if("undefined" != typeof app.globalData.tempBackImg)
    {
      const backImg = app.globalData.tempBackImg
      delete app.globalData.tempBackImg
      this.uploadBackImg(backImg)
      return;
    }
    if (!this.haveData()) {
      wx.showModal({
        title: '提示',
        content: '课表为空，是否更新？',
        success: (res)=> {
          if (res.confirm) {
            this.getCourseFromServer()
          } else if (res.cancel) {
            wx.showToast({
              title: '可以长按该页面,从服务器拉取数据',
              icon: 'none',
              duration: 3000
            })
          }
        }
      })
      return
    }
    this.incrementZero()
  },

  /**
   * 下拉事件
   */
  onPullDownRefresh: function () {
    setTimeout(this.incrementZero, 500)
    setTimeout(wx.stopPullDownRefresh, 500)
  },

  /**
   * 分享至微信朋友圈
   */
  onShareTimeline: function(){
    return {
      title: '成信大课表',
      query: '',
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    return {
      title: '成信大课表',
      // for wechat
      path: '/pages/courseTable/courseTable',
      // for qq
      query: '',
    }
  },

  getWeekList: function (week_num) {
    var week_list = []
    if(0 == week_num)
      week_list = app.globalData.classtable
    else
      for (var i = 0; i < app.globalData.classtable.length; i++) {
        if (app.globalData.classtable[i].week_num.indexOf(week_num) != -1) {
          week_list.push({
            day_of_week: app.globalData.classtable[i].day_of_week,
            class_of_day: app.globalData.classtable[i].class_of_day,
            duration: app.globalData.classtable[i].duration,
            name: app.globalData.classtable[i].name,
            place: app.globalData.classtable[i].place,
            teacherName: app.globalData.classtable[i].teacherName
          })
        }
      }
    return week_list
  },

  updateScreen: function () {
    if (!this.haveData()) {
      return
    }
    var now = new Date()
    var diff_day_without_increment = parseInt((now - app.globalData.start) / (1000 * 60 * 60 * 24))
    // console.log("已开学：" + diff_day_without_increment + "---今天周" + (diff_day_without_increment % 7))
    var diff_day = diff_day_without_increment + this.data.increment
    if (diff_day < -7) {
      diff_day = -7
      this.data.increment += 7
    }
    this.setData({ increment: this.data.increment })

    var week_num = parseInt(diff_day / 7 + 1)
    var week_list = this.getWeekList(week_num)
    this.setData({
      week_num: week_num,
      week_list: week_list,
      day_num: diff_day_without_increment % 7
    })
    if(0 == week_num)
      wx.setNavigationBarTitle({
        title: "全部"
      })
    else
      wx.setNavigationBarTitle({
        title: "第" + this.data.week_num + "周"
      })
  },

  incrementAdd: function () {
    this.data.increment = this.data.increment + 7
    this.updateScreen()
  },

  incrementSub: function () {
    this.data.increment = this.data.increment - 7
    this.updateScreen()
  },

  /**
   * 重置相对于当天的天数增量
   */
  incrementZero: function () {
    this.setData({ increment: 0 })
    this.updateScreen()
  },

  handleTouchMove: function (event) {
    var currentX = event.touches[0].pageX
    var currentY = event.touches[0].pageY
    var tx = currentX - this.data.lastX
    var ty = currentY - this.data.lastY
    if (tx < -100) { this.data.currentGesture = 'left' }
    else if (tx > 100) { this.data.currentGesture = 'right' }
    else if (ty < -100) { this.data.currentGesture = 'top' }

  },

  handleTouchStart: function (event) {
    this.data.lastX = event.touches[0].pageX
    this.data.lastY = event.touches[0].pageY
  },

  /**
   * 滑动处理事件
   * @param {*} event 
   */
  handleTouchEnd: function (event) {
    if (this.data.currentGesture == 'left') { this.incrementAdd() }
    if (this.data.currentGesture == 'right') { this.incrementSub() }
    if (this.data.currentGesture == 'top') { this.settingFrameSwitch() }
    this.data.currentGesture = 0;
  },

  settingFrameSwitch:function()
  {
    this.setData({
      settingHidden: !this.data.settingHidden
    })
  },

  // 不透明度变更
  bindOpacityChange: function(e)
  {
    const type = e.currentTarget.dataset.type
    var t = {}
    t[type + 'Opacity'] = e.detail.value / 100
    this.setData(t)
    wx.setStorage({
      data: e.detail.value / 100,
      key: type + 'Opacity',
    })
  },

  // 上传图片
  uploadBackImg: function(img)
  {
    wx.saveFile({
      tempFilePath: img,
      success: (res) => {
        const savedFilePath = res.savedFilePath
        this.setData({background: savedFilePath})
          wx.setStorage({
            data: savedFilePath,
            key: 'courseTableImg',
          })
      },
      fail: err=>{
        if(err.errMsg)
          wx.showToast({
            icon: 'none',
            title: err.errMsg
          })
      }
    })
    return;
  },

  // 背景图
  settingSelectImg:function()
  {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        wx.navigateTo({
          url: '/pages/courseTable/imgCropper/imgCropper?src=' + tempFilePaths[0] + '&width=' + app.globalData.windowWidth + '&height=' + app.globalData.windowHeight,
        })
      }
    })
  },

  /**
   * 从服务器拉取课表数据
   */
  getCourseFromServer: function () {
    // console.log(this.data.termArray[1][this.data.termIndex[1]])
    app.httpPost({
        url: '/Jwgl/getCourseTableV2/',
        data: {
          'cookie': "semester.id=" + this.data.termArray[1][this.data.termIndex[1]].id + ";" + this.data.sessionInfo.JWGL_cookie + '; TWFID=' + this.data.sessionInfo.TWFID,
          'courseType': this.data.courseTypeArray[this.data.courseTypeIndex].key,
          'semester': this.data.termArray[1][this.data.termIndex[1]].id
        },
    }).then((res)=>{

      try {
        var obj = res
        if (obj.start.year == null) {
          throw 'Error'
        }
        wx.startPullDownRefresh();
        app.globalData.start = new Date(
          obj.start.year,
          obj.start.month - 1,
          obj.start.day)

        app.globalData.classtable = obj.classtable
        app.globalData.location = obj.location
        wx.setStorage({
          key: 'start',
          data: app.globalData.start
        })
        wx.setStorage({
          key: 'classtable',
          data: app.globalData.classtable
        })
        wx.setStorage({
          key: 'location',
          data: app.globalData.location
        })
        setTimeout(this.incrementZero, 500)
        setTimeout(wx.stopPullDownRefresh, 500)
      } catch (e) {
        wx.showToast({
          title: '信息有误',
          icon: 'none',
          duration: 5000
        })
      }
    }).catch(err=>{
      this.handelERR(err)
    })
  },

   /**
   * 获取周数，学期信息
   */
  getOptions: function()
  {
    let semesterId = this.data.termArray[1][this.data.termIndex[1]].id!==0?"semester.id=" + this.data.termArray[1][this.data.termIndex[1]].id + ";":"";
    app.httpPost({
        url: '/Jwgl/getCourseOption/',
        data: {
          cookie: `${semesterId}${this.data.sessionInfo.JWGL_cookie};TWFID=${this.data.sessionInfo.TWFID}`
        },

    }).then((res)=>{
      let tempData = {}
      let sem = res.semesters
      tempData['courseTypeArray'] = res.courseType
      tempData['courseWeekArray'] = res.courseWeek
      wx.setStorage({
        data: res.courseWeek,
        key: 'courseWeekArray',
      })
      tempData['termArray'] = [sem.list[0]]
      tempData['termArray'][1] = sem.list[1][sem.index[0]===-1?0:sem.index[0]];
      if(sem.index[0] !== -1 && sem.index[1] !== -1)
        tempData['termIndex'] = sem.index;
      this.data.termData = sem.list[1]
      this.setData(tempData)
    }).catch((err)=>{
      this.handelERR(err)
      return;
    })
  },

  /**
   * 长按事件
   */
  bindLongTab: function () {
    var _this = this
    wx.showModal({
      title: '提示',
      content: '是否从服务器更新课表',
      success: function (res) {
        if (res.confirm) {
          _this.getCourseFromServer()
        }
      }
    })
  },

  /**
   * 课表类型变化事件
   * @param {*} e 
   */
  bindCourseTypePicker: function(e) {
    this.setData({
      courseTypeIndex: e.detail.value
    })
    this.bindLongTab();
  },

  /**
   * 周数选项确定事件
   * @param {*} e 
   */
  bindWeekChange: function(e) {
    // value值固定为字符串，需要强转一下
    var week_num =  parseInt(e.detail.value)
    var week_list = this.getWeekList(week_num)
    var diff_day_without_increment = parseInt((new Date() - app.globalData.start) / (1000 * 60 * 60 * 24))
    var this_week_num = parseInt(diff_day_without_increment / 7 + 1)
    var increment = (week_num - this_week_num) * 7
    this.setData({
      week_num: week_num,
      week_list: week_list,
      increment: increment
    })
    
    if(0 == week_num)
      wx.setNavigationBarTitle({
        title: "全部"
      })
    else
      wx.setNavigationBarTitle({
        title: "第" + this.data.week_num + "周"
      })
  },

  /**
   * 学期选项确定事件
   */
  bindTermChange: function (e) {
    this.setData({
      termIndex: e.detail.value
    })
    this.bindLongTab();
  },

  /**
   * 学期选项列变化事件
   * @param {*} e 
   */
  bindTermColumnChange: function (e) {
    console.log(e)
    console.log(this.data.termData)
    var data = {
      termArray: this.data.termArray,
      termIndex: this.data.termIndex
    };
    data.termIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        // 第二列、第三列默认索引值0
        data.termArray[1] = this.data.termData[e.detail.value]
        data.termIndex[1] = 0;
        break;
    }
    this.setData({
      termArray: data.termArray,
      termIndex: data.termIndex,
    })
  },
  handelERR: function(err){
    if(13401 === err.errorCode)
    {
      wx.showToast({
        icon: 'none',
        title: err.errMsg,
      })
      // 没有数据未登录--打开登录界面；有数据未登录不打开登陆界面
      if(!this.haveData() && this.data.isFirstOpenSSO)
      {
        this.data.isFirstOpenSSO = false
        wx.navigateTo({
          url: '../my/sso/sso'
        })
      }
    }else if(err.errMsg)
    {
      wx.showToast({
        icon: 'none',
        title: err.errMsg,
      })
    }else{
      console.error(err)
      wx.showToast({
        icon: 'none',
        title: '未知异常',
      })
    }
  }
})
