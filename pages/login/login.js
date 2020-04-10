// pages/login/login.js
var API_URL = 'https://www.wetech.top'
var wx_login_url = "https://wetech.top:7443/petcage/wx_login"
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
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
    that.setData({
      rawData: e.detail.rawData,
      userInfo: e.detail.userInfo
    })
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
            console.log("登录成功")
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
            console.log("登录失败")
            wx.showToast({
              title: '登录失败',
              icon: "warn",
              duration: 1000
            })
          }
        })
      },
      fail(err) {
        console.log("登录失败")
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
        console.log('用户经纬度：' + latitude + ',' + longitude)
      }
    })
  },

  register: function() {
    console.log("navigate to register.")
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
    console.log(this.data)
    wx.request({
      url: 'https://wetech.top:7443/petcage/login?phone=' + this.data.account + '&pwd=' + this.data.password,
      //定义传到后台的数据
      data: {
        //从全局变量data中获取数据
        phone: this.data.account,
        pwd: this.data.password
      },
      method: 'post', //定义传到后台接受的是post方法还是get方法
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log("调用API成功");
        console.log(res)
        console.log(res.data.message);
        if (res.data == true) {
          wx.showToast({
            title: '登陆成功',
            icon: 'success',
            duration: 2000
          })
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
        console.log("调用API失败");
        console.log(res)
        wx.showToast({
          title: '登录失败',
          icon: 'warn',
          duration: 2000
        })
      }
    })
  }
})