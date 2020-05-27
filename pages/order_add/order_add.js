// pages/order_add/order_add.js

var add_pet = 'https://pipilong.pet:7443/petcage/add_pet'
var add_order = 'https://pipilong.pet:7443/petcage/add_order'

//获取应用实例
const app = getApp();

Page({
  data: {
    pet_contact: '',
    pet_type: '',
    pet_variety: '',
    pet_nick_name: '',
    pet_gender: "",
    pet_birthday: "",
    device_id: "",
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
  },
  onLoad: function(options) {
    this.setData({
      device_id: options.device_id
    });
  },
  //用于生成uuid
  s4: function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  },
  guid: function() {
    return (this.s4() + this.s4() + "-" + this.s4() + "-" + this.s4() + "-" + this.s4() + "-" + this.s4() + this.s4() + this.s4());
  },
  //联系人手机号输入
  bindContactInput(e) {
    this.setData({
      pet_contact: e.detail.value
    })
  },
  //类型输入
  bindPetTypeInput(e) {
    this.setData({
      pet_type: e.detail.value
    })
  },
  //品种输入
  bindPetVarietyInput(e) {
    console.log(e.detail.value);
    this.setData({
      pet_variety: e.detail.value
    })
  },
  //昵称输入
  bindNickNameInput(e) {
    this.setData({
      pet_nick_name: e.detail.value
    })
  },
  //性别输入
  bindGenderInput(e) {
    this.setData({
      pet_gender: e.detail.value
    })
  },
  //出生日期输入
  bindBirthdayInput(e) {
    this.setData({
      pet_birthday: e.detail.value
    })
  },
  //保存
  save(e) {
    var that = this;
    console.log('宠物类型: ' + that.data.pet_type);
    console.log('宠物品种: ' + that.data.pet_variety);
    console.log('宠物昵称: ' + that.data.pet_nick_name);
    console.log('宠物性别: ' + that.data.pet_gender);
    console.log('宠物出生日期: ' + that.data.pet_birthday);
    if (!that.data.pet_type || !that.data.pet_contact) {
      wx.showModal({
        title: '请填写宠物类型和宠物联系人',
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
      return
    }

    let open_id = wx.getStorageSync("open_id")
    console.log("open_id: " + open_id)
    let token = wx.getStorageSync("token");

    //添加宠物，请求后台
    var order_id = that.guid()
    wx.request({
      url: add_pet,
      data: {
        order_id: that.guid(),
        contact: that.data.pet_contact,
        pet_type: that.data.pet_type,
        variety: that.data.pet_variety,
        nick_name: that.data.pet_nick_name,
        gender: that.data.pet_gender,
        age: that.data.pet_birthday
      },
      method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "token": token
      },
      success: function(res) {
        if (res.data > 0) {
          // success
          wx.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 1000
          })
        } else {
          wx.showModal({
            title: '请填写联系人和宠物类型',
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
        console.log('服务器返回');
        console.log(res.data)
      },
      fail: function() {
        // fail
        wx.showToast({
          title: '添加失败',
          icon: 'warn',
          duration: 1000
        })
      }
    })

    // 添加订单
    wx.request({
      url: add_order,
      method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "token": token
      },
      data: {
        order_id: order_id,
        phone: that.data.pet_contact,
        open_id: open_id,
        device_id: that.data.device_id
      },
      success(res) {
        if (res.data > 0) {
          console.log("创建订单成功")
          // 把订单id带回上一页
          var pages = getCurrentPages();
          var currPage = pages[pages.length - 1]; //当前页面
          var prevPage = pages[pages.length - 2]; //上一个页面
          //直接调用上一个页面对象的setData()方法，把数据存到上一个页面中去
          prevPage.setData({
            order_id: order_id
          })
          wx.setStorageSync('order_id', order_id)
          wx.navigateBack({
            delta: 1
          })
        } else {
          console.log("创建订单失败")
          wx.showToast({
            title: '服务器错误，请重试！',
            icon: 'warn',
            duration: 2000
          })
        }
      }
    })
  }
})