const app = getApp()
Page({
  data: {
    imgs: [
      "http://img.kaiyanapp.com/5edbf92b929f9174e3b69500df52ee21.jpeg?imageMogr2/quality/60",
      "http://img.kaiyanapp.com/f2c497cb520d8360ef2980ecd0efdee7.jpeg?imageMogr2/quality/60",
      "http://img.kaiyanapp.com/64f96635ddc425e3be237b5f70374d87.jpeg?imageMogr2/quality/60",
    ],
    img: "http://img.kaiyanapp.com/7ff70fb62f596267ea863e1acb4fa484.jpeg",
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
  },

  start() {
    wx.navigateTo({
      url: '../map/map'
    })
  },


})