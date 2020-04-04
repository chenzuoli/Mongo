// pages/test/test.js
// const regeneratorRuntime = require('../../lib/regenerator-runtime/runtime')
var app = getApp();
const api = app.globalData.api
var get_service_id = 'https://wetech.top:7443/petcage/get_service_id'
var get_access_token_url = 'https://wetech.top:7443/petcage/access_token';

//获取应用实例  
var app = getApp();

Page({
  /**
   * Page initial data
   */
  data: {
    token: "",
    service_id: ""
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {
    var that = this

    wx.navigateTo({
      url: '../map/map',
    })
    console.log("---------测试navigateTo之后的代码是否会运行--------")

    let open_id = wx.getStorageSync("open_id")
    console.log("open_id: " + open_id)
    wx.login({
      success: function(res) {
        wx.request({
          url: get_access_token_url,
          method: 'get', //定义传到后台接受的是post方法还是get方法
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function(res) {
            console.log("获取access token成功" + res.data)
          },
          fail: function(err) {
            console.log("获取access token失败" + err.data)
          }
        })
      }
    })
    that.testAsync()

    console.log("测试异步请求变同步")
    this.init()
  },

  getQrcode() {
    wx.request({
      url: "https://www....com/weixin/get-qrcode", //域名省略
      data: {
        page: "pages/index",
        scene: "1234&123",
        width: 300
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      dataType: 'json',
      success: function(res) {
        let qrcodeUrl = res.data.data.code_path; //服务器小程序码地址
      },
      fail: function() {},
      complete: options.complete || function() {}
    })
  },

  testAsync: async function () {
    let res = await app.chooseImage()
    console.log(res)
    res = await app.request({ 
      url: get_access_token_url, 
      method: 'get', data: { x: 0, y: 1 } 
      })
    console.log(res)
  },
  async init() {
    await api.showLoading() // 显示loading
    await this.getList(1)  // 请求数据
    await this.getList(2)  // 请求数据
    await this.getList(3)  // 请求数据
    await this.getList(4)  // 请求数据
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