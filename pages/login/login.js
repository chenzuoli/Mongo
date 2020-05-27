// pages/login/login.js
var wx_login_url = "https://pipilong.pet:7443/petcage/wx_login"
var login_url = 'https://pipilong.pet:7443/petcage/login'
const app = getApp()

Page({
  data: {
    account: "",
    password: "",
    message: "",
    rawData: "",
    userInfo: "",
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
  },
  onGotUserInfo: function(e) {
    var that = this;
    that.setData({
      rawData: e.detail.rawData,
      userInfo: e.detail.userInfo
    })
    wx.login({
      success(res) {
        wx.request({
          url: wx_login_url,
          data: {
            js_code: res.code,
            rawData: that.data.rawData
          },
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          method: 'get', //定义传到后台接受的是post方法还是get方法
          success(res) {
            wx.showToast({
              title: '登录成功',
              icon: "success",
              duration: 1000
            })
            wx.setStorageSync("token", res.data.data.token)
            wx.navigateTo({
              url: '../map/map',
            })
          },
          fail(err) {
            wx.showToast({
              title: '登录失败',
              icon: "warn",
              duration: 1000
            })
          }
        })
      },
      fail(err) {
        wx.showToast({
          title: '登录失败',
          icon: "warn",
          duration: 1000
        })
      }
    })
  },
  onReady: function() {
    wx.getLocation({
      type: 'location',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
      }
    })
  },

  register: function() {
    wx.navigateTo({
      url: '../register/register',
    })
  },
  //处理accountInput的触发事件
  accountInput: function(e) {
    var username = e.detail.value; //从页面获取到用户输入的用户名/邮箱/手机号
    if (username != '') {
      this.setData({
        account: username
      }); //把获取到的密码赋值给全局变量Date中的password
    }
  },
  //处理pwdBlurt的触发事件
  pwdBlur: function(e) {
    var pwd = e.detail.value; //从页面获取到用户输入的密码
    if (pwd != '') {
      this.setData({
        password: pwd
      }); //把获取到的密码赋值给全局变量Date中的password
    }
  },
  //处理login的触发事件
  login: function(e) {
    var that = this
    wx.request({
      url: login_url,
      //定义传到后台的数据
      data: {
        //从全局变量data中获取数据
        phone: that.data.account,
        pwd: that.data.password
      },
      method: 'post', //定义传到后台接受的是post方法还是get方法
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        if (res.data.status == '200') {
          wx.showToast({
            title: '登陆成功',
            icon: 'success',
            duration: 2000
          })
          wx.setStorageSync("token", res.data.data)
          wx.setStorageSync("phone", that.data.account)
          wx.navigateTo({
            url: '../map/map',
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '用户名或者密码错误',
            showCancel: false
          })
        }
      },
      fail: function(res) {
        wx.showToast({
          title: '登录失败',
          icon: 'warn',
          duration: 2000
        })
      }
    })
  }
})