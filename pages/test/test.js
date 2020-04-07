// pages/test/test.js
// const regeneratorRuntime = require('../../lib/regenerator-runtime/runtime')
var app = getApp();
const api = app.globalData.api
var get_service_id = 'https://wetech.top:7443/petcage/get_service_id'
var get_access_token_url = 'https://wetech.top:7443/petcage/access_token';
var get_qrcode_url = 'https://api.weixin.qq.com/wxa/getwxacodeunlimit'
//获取应用实例  
var app = getApp();

Page({
  /**
   * Page initial data
   */
  data: {
    token: "",
    service_id: "",
    imagesList: [],
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    avatar: ""
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {
    var that = this

    // 更换图片
    

    // wx.navigateTo({
    //   url: '../map/map',
    // })
    // console.log("---------测试navigateTo之后的代码是否会运行--------")

    // let open_id = wx.getStorageSync("open_id")
    // console.log("open_id: " + open_id)
    // wx.login({
    //   success: function(res) {
    //     wx.request({
    //       url: get_access_token_url,
    //       method: 'get', //定义传到后台接受的是post方法还是get方法
    //       header: {
    //         'content-type': 'application/json' // 默认值
    //       },
    //       success: function(res) {
    //         console.log("获取access token成功:" + res.data)
    //         that.setData({
    //           token: res.data
    //         })
    //         that.getQrcode()
    //       },
    //       fail: function(err) {
    //         console.log("获取access token失败:" + err.data)
    //       }
    //     })
    //   }
    // })
    // that.testAsync()

    // console.log("测试异步请求变同步")
    // that.init()
  },
  chooseImage: function () {
    var that = this
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        console.log(res)
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.setData({
          // imagesList: tempFilePaths
          avatar: tempFilePaths
        })
        console.log(tempFilePaths)
      }
    })
  },
  previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: this.data.imagesList // 需要预览的图片http链接列表  
    })
  },

  getQrcode() {
    var that = this
    wx.request({
      url: get_qrcode_url + "?access_token=" + that.data.token + "&page=pages/map/map&scene=123", //域名省略
      data: {
        page: "pages/map/map",
        scene: "1234&123",
        width: 300
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      dataType: 'json',
      success: function(res) {
        console.log(res)
      },
      fail: function(err) {
        console.log(err)
      },
      // complete: options.complete || function () { }
    })
  },

  testAsync: async function() {
    let res = await app.chooseImage()
    console.log(res)
    res = await app.request({
      url: get_access_token_url,
      method: 'get',
      data: {
        x: 0,
        y: 1
      }
    })
    console.log(res)
  },
  async init() {
    await api.showLoading() // 显示loading
    await this.getList(1) // 请求数据
    await this.getList(2) // 请求数据
    await this.getList(3) // 请求数据
    await this.getList(4) // 请求数据
    await api.hideLoading() // 等待请求数据成功后，隐藏loading
  },
  // 获取列表
  getList(e) {
    console.log(e)
    return new Promise((resolve, reject) => {
      api.getData(get_service_id, {
          x: '',
          y: ''
        }).then((res) => {
          this.setData({
            service_id: res.data
          })
          console.log(res)
          resolve()
        })
        .catch((err) => {
          console.error(err)
          reject(err)
        })
    })
  },

})