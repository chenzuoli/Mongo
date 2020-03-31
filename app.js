//app.js
var login_url = 'https://wetech.top:7443/petcage/open_id'
App({
  globalData: {
    userInfo: {
      phone: "",
      open_id: "",
      union_id: "",
      token: "",
    },
  },
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({ // 登录
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      success: res => {
        console.log("js_code: " + res.code)
        wx.request({
          url: login_url + "?js_code=" + res.code,
          method: 'POST',
          header: {
            'content-type': 'application/json' // 默认值
          },
          data: {
            js_code: res.code
          },
          success(res) {
            console.log("login success.")
            console.log(res.data)
            //必须先清除，否则res.header['Set-Cookie']会报错
            wx.removeStorageSync('sessionid');
            //储存res.header['Set-Cookie']
            wx.setStorageSync("sessionid", res.header["Set-Cookie"]);
          },
          fail(err) {
            console.log("login failed.")
          }
        });
      }
    });

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    var isFirst = wx.getStorageSync('isFirst')
    if (isFirst) {
      wx.navigateTo({
        url: '/pages/map/map',
      })
    } else {
      wx.navigateTo({
        // url: '/pages/login/login',
        url: '/pages/map/map',
        // url: '/pages/userInfo/userInfo'
        // url: '/pages/bluetooth_v2/bluetooth_v2'
      })
    }
  },
  onShow: function (options) {
    let option = JSON.stringify(options);
    console.log('app.js option-----' + option)
    console.log('app.js>>options.scene--------------------' + options.scene);
    var resultScene = this.sceneInfo(options.scene);
    console.log(resultScene);
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              wx.setStorageSync('isFirst', res.userInfo)
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  }
})