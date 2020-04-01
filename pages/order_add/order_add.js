// pages/order_add/order_add.js

var add_pet = 'https://localhost:7443/petcage/add_pet'
//获取应用实例
const app = getApp();

Page({
  data: {
    pet_contact: '',
    pet_type: '',
    pet_variety: '',
    pet_nick_name: '',
    pet_gender: "",
    pet_age: ""
  },
  //用于生成uuid
  s4: function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  },
  guid: function () {
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
  //年龄输入
  bindAgeInput(e) {
    this.setData({
      pet_age: e.detail.value
    })
  },
  //保存
  save(e) {
    var that = this;
    console.log('宠物类型: ' + that.data.pet_type);
    console.log('宠物品种: ' + that.data.pet_variety);
    console.log('宠物昵称: ' + that.data.pet_nick_name);
    console.log('宠物性别: ' + that.data.pet_gender);
    console.log('宠物年龄: ' + that.data.pet_age);
    if(!that.data.pet_type || !that.data.pet_contact) {
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
    //注册，请求后台
    wx.request({
      url: add_pet + "?order_id=" + that.guid() + "&contact=" + that.data.pet_contact + "&pet_type=" + that.data.pet_type + "&variety=" + that.data.pet_variety + "&nick_name=" + that.data.pet_nick_name + "&gender=" + that.data.pet_gender + "&age=" + that.data.pet_age,
      data: {
        order_id: this.guid(),
        pet_type: this.data.pet_type,
        variety: this.data.pet_variety,
        nick_name: this.data.pet_nick_name,
        gender: this.data.pet_gender,
        age: this.data.pet_age
      },
      method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'content-type': 'application/json'
      }, // 设置请求的 header
      success: function (res) {
        if (res.data > 0) {
          // success
          wx.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 1000
          })
          wx.navigateTo({
            url: '../map/map',
          })
        } else {
          wx.showModal({
            title: '请填写宠物类型',
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
      fail: function () {
        // fail
        wx.showToast({
          title: '添加失败',
          icon: 'warn',
          duration: 1000
        })
      }
    })
  }
})
