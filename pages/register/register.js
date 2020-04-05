//index.js
var zhenzisms = require('../../utils/zhenzisms.js');
var get_code_url = 'https://wetech.top:7443/smsCode'
var register_url = 'https://wetech.top:7443/register'
var wx_login_url = "https://wetech.top:7443/petcage/wx_login"
var get_service_private_content = 'https://localhost:7443/petcage/get_service_private_content'

//获取应用实例
const app = getApp();

Page({
  data: {
    hidden: true,
    btnValue: '',
    btnDisabled: false,
    name: '',
    phone: '',
    code: '',
    second: 60,
    rawData: "",
    userInfo: "",
    service_content: "",
    private_content: "",
    is_agree: "0"
  },
  onLoad: function() {

  },
  //姓名输入
  bindNameInput(e) {
    this.setData({
      name: e.detail.value
    })
  },
  //手机号输入
  bindPhoneInput(e) {
    console.log(e.detail.value);
    var val = e.detail.value;
    this.setData({
      phone: val
    })
    if (val != '') {
      this.setData({
        hidden: false,
        btnValue: '获取验证码'
      })
    } else {
      this.setData({
        hidden: true
      })
    }
  },
  //验证码输入
  bindCodeInput(e) {
    this.setData({
      code: e.detail.value
    })
  },
  //获取短信验证码
  getCode(e) {
    console.log('获取验证码');
    var that = this;
    wx.request({
      url: this.get_code_url,
      data: {
        phone: that.phone
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'content-type': 'application/json'
      }, // 设置请求的 header
      success: function(res) {
        // success
        wx.showToast({
          title: '发送成功',
          icon: 'success',
          duration: 1000
        })
        console.log('服务器返回: ' + res.data);
        if (res.data == 0) {
          that.timer();
          return;
        }
      },
      fail: function() {
        // fail
        wx.showToast({
          title: '发送失败',
          icon: 'warn',
          duration: 1000
        })
      },
      complete: function() {
        // complete
      }
    })
  },
  timer: function() {
    let promise = new Promise((resolve, reject) => {
      let setTimer = setInterval(
        () => {
          var second = this.data.second - 1;
          this.setData({
            second: second,
            btnValue: second + '秒',
            btnDisabled: true
          })
          if (this.data.second <= 0) {
            this.setData({
              second: 60,
              btnValue: '获取验证码',
              btnDisabled: false
            })
            resolve(setTimer)
          }
        }, 1000)
    })
    promise.then((setTimer) => {
      clearInterval(setTimer)
    })
  },
  //保存
  async save(e) {
    var that = this
    console.log('姓名: ' + this.data.name);
    console.log('手机号: ' + this.data.phone);
    console.log('验证码: ' + this.data.code);
    // 从数据库中获取服务条例与隐私协议内容
    await that.get_service_private_content()
    // 展示服务条例与隐私协议
    await that.show_service_private_content()
    if (that.data.is_agree == '0') {
      return
    }
    //注册，请求后台
    await that.register()
  },
  get_service_private_content() {
    var that = this
    return new Promise((resolve, reject) => {
      wx.request({
        url: get_service_private_content,
        method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success(res) {
          console.log("获取服务条例与隐私协议成功")
          that.setData({
            service_content: res.data.data.service_content,
            private_content: res.data.data.private_content
          })
          resolve(res)
        },
        fail(err) {
          console.log("获取服务条例与隐私协议失败")
          console.log(err)
          reject(err)
        }
      })
    })
  },
  show_service_private_content() {
    var that = this
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: '服务条例与隐私协议',
        content: that.data.service_content + "\n" + that.data.private_content,
        showCancel: true, //是否显示取消按钮
        cancelText: "取消", //默认是“取消”
        cancelColor: 'skyblue', //取消文字的颜色
        confirmText: "同意", //默认是“确定”
        confirmColor: 'skyblue', //确定文字的颜色
        success: function(res) {
          if (res.confirm) {
            that.setData({
              is_agree: "1"
            })
          }
          resolve(res)
        },
        fail: function(err) {
          console.log("展示服务条例与隐私协议失败")
          console.log(err)
          reject(err)
        }
      })
    })
  },
  register() {
    var that = this
    return new Promise((resolve, reject) => {
      wx.request({
        url: '',
        data: {
          phone: this.data.phone,
          sms_code: this.data.code
        },
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function(res) {
          // success
          wx.showToast({
            title: '注册成功',
            icon: 'success',
            duration: 1000
          })
          console.log('服务器返回' + res.data);
          wx.navigateTo({
            url: '../login/login',
          })
          resolve(res)
        },
        fail: function(err) {
          // fail
          wx.showToast({
            title: '注册失败',
            icon: 'warn',
            duration: 1000
          })
          console.log("注册失败")
          console.log(err)
          reject(err)
        },
      })
    })
  },
  onGotUserInfo: async function(e) {
    var that = this;
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
    that.setData({
      rawData: e.detail.rawData,
      userInfo: e.detail.userInfo
    })
    // 从数据库中获取服务条例与隐私协议内容
    await that.get_service_private_content()
    // 展示服务条例与隐私协议
    await that.show_service_private_content()
    if (that.data.is_agree == '0') {
      return
    }
    // 注册
    await that.login()
  },
  login: function() {
    var that = this
    return new Promise((resolve, reject) => {
      wx.login({
        success(res) {
          console.log(that.data.rawData)
          console.log(that.data.userInfo)
          wx.request({
            url: wx_login_url,
            data: {
              js_code: res.code,
              rawData: that.data.rawData
            },
            success(res) {
              console.log("注册成功")
              wx.showToast({
                title: '注册成功',
                icon: "success",
                duration: 1000
              })
              wx.navigateTo({
                url: '../login/login',
              })
            },
            fail(err) {
              console.log("注册失败")
              wx.showToast({
                title: '注册失败',
                icon: "warn",
                duration: 1000
              })
            }
          })
          resolve(res)
        },
        fail(err) {
          console.log("注册失败")
          console.log(err)
          wx.showToast({
            title: '注册失败',
            icon: "warn",
            duration: 1000
          })
          reject(err)
        }
      })
    })
  }
  // login: function() {
  //   console.log("navigate to login.")
  //   wx.navigateTo({
  //     url: '../login/login',
  //   })
  // },
})