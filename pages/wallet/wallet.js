// pages/wallet/wallet.js
var get_user_wallet_url = 'https://localhost:7443/petcage/get_user_wallet'
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    nick_name: "",
    balance: "0",
    freeEndDate: "",
    hidden: true,
    amountList: [
      100, 50, 20, 10
    ],
    curSelected: '0',
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
  },
  selectAmount: function (e) {
    var dataId = e.target.dataset.id;
    console.log(dataId)
    this.setData({
      curSelected: dataId
    })
  },
  toPay: function () {
    console.log("充值")
    wx.requestPayment({
      'timeStamp': '',
      'nonceStr': '',
      'package': '',
      'signType': 'MD5',
      'paySign': '',
      'success': function (res) {
        console.log("调起支付成功")
      },
      'fail': function (res) {
        console.log("调起支付失败")
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    let open_id = wx.getStorageSync("open_id")
    console.log("open_id: " + open_id)
    wx.request({
      url: get_user_wallet_url + "?open_id=" + open_id,
      data: {
        open_id: open_id
      },
      method: 'post', //定义传到后台接受的是post方法还是get方法
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log("获取用户钱包成功：")
        console.log(res.data)
        if (res.data == null) {
          wx.showModal({
            title: '请先注册',
            content: '',
            confirmText: '继续填写',
            cancelText: '返回',
            success: (res) => {
              if (res.confirm) {
                console.log(res);
              } else {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        }
        that.setData({
          balance: res.data.data.balance,
          freeEndDate: res.data.data.valid_end_date.substring(0, 10),
          nick_name: res.data.data.nick_name
        })
        if (res.data.data.user_type != '1') {
          that.setData({
            hidden: false
          })
        }
      },
      fail: function (res) {
        console.log("获取用户钱包失败")
      }
    })
  },
  
  user_index: function() {
    wx.navigateTo({
      url: '../user_index/index/index',
      // url: '../about/home/home',
      success: (result)=>{
        
      },
      fail: ()=>{},
      complete: ()=>{}
    });
  }

})