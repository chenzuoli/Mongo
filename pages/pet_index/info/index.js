var util = require('../../../utils/util')
const app = getApp();
var get_user_info = 'https://wetech.top:7443/petcage/get_user_by_open_id'
var get_dim_pet = 'https://wetech.top:7443/petcage/get_dim_pet'
var update_user_pet = 'https://wetech.top:7443/petcage/update_user_pet'
var upload_file_url = 'https://wetech.top:7443/petcage/upload_file'

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    index: null,
    picker: ['0-3', '4-8', '9-20', '20以上'],
    multiArray: [
      ['狗', '猫', '其他动物', '鱼', '鸟'],
      ['哈士奇', '边境牧羊犬', '金毛寻回犬', '拉布拉多', '泰迪']
    ],
    multiIndex: [0, 0],
    time: '12:01',
    date: '2018-12-25',
    region: ['湖北省', '武汉市', '江夏区'],
    imgList: [],
    modalName: null,
    textareaAValue: '',
    textareaBValue: '',
    nick_name: '',
    contact: '',
    avatar: '',
    now: '',
    pet_type: [],
    pet_variety: []
  },
  onLoad: async function () {
    var that = this
    let open_id = wx.getStorageSync("open_id");
    console.log("open_id: " + open_id)
    // 获取用户信息
    await that.get_user_info(open_id)
    const formatTime = util.formatTime(new Date())
    console.log("now: " + formatTime)
    that.setData({
      now: formatTime
    })
    await that.get_dim_pet()
  },
  get_user_info: function (open_id) {
    var that = this
    return new Promise((resolve, reject) => {
      var reqTask = wx.request({
        url: get_user_info + "?open_id=" + open_id,
        data: {},
        header: { 'content-type': 'application/json' },
        method: 'post',
        dataType: 'json',
        responseType: 'text',
        success: (result) => {
          console.log(result)
          that.setData({
            nick_name: result.data.data.nick_name,
            phone: result.data.data.phone,
            avatar: result.data.data.avatar_url
          })
          resolve(result)
        },
        fail: (err) => {
          console.log("请求获取用户信息失败。")
          console.log(err)
          reject(err)
        },
        complete: () => { }
      });
    })
  },
  get_dim_pet: function () {
    var that = this
    return new Promise((resolve, reject) => {
      wx.request({
        url: get_dim_pet,
        data: {},
        header: { 'content-type': 'application/json' },
        method: 'post',
        dataType: 'json',
        responseType: 'text',
        success: (result) => {
          console.log(result)
          var pets = result.data.data
          var pet_type = []
          var pet_variety = []
          for (var i = 0; i < pets.length; i++) {
            if (pet_type.indexOf(pets[i].pet_type) == -1) {
              console.log("pet variety: " + pet_variety)
              if (i != 0) {
                that.data.pet_variety.push(pet_variety)
              }
              pet_type.push(pets[i].pet_type)
              pet_variety = []
            }
            pet_variety.push(pets[i].variety)
          }
          that.data.pet_variety.push(pet_variety)
          that.data.pet_type = pet_type
          console.log(that.data.pet_type)
          console.log(that.data.pet_variety)
          that.setData({
            multiArray: [pet_type, that.data.pet_variety[0]]
          })
          resolve(result)
        },
        fail: (err) => {
          console.log("获取宠物维表失败")
          console.log(err)
          reject(err)
        },
        complete: () => { }
      });
    })
  },
  PickerChange(e) {
    console.log(e);
    this.setData({
      index: e.detail.value
    })
  },
  MultiChange(e) {
    console.log("multichange: ")
    console.log(e)
    this.setData({
      multiIndex: e.detail.value
    })
  },
  MultiColumnChange(e) {
    var that = this
    console.log("multicolumnchange: ")
    console.log(e)
    let data = {
      multiIndex: this.data.multiIndex,
      multiArray: this.data.multiArray
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        data.multiArray[1] = that.data.pet_variety[e.detail.value];
        data.multiIndex[1] = 0;
        break;
      case 1:
        data.multiIndex[1] = e.detail.value;
        break;
    }
    this.setData(data);
  },
  TimeChange(e) {
    this.setData({
      time: e.detail.value
    })
  },
  DateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  RegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },
  ChooseImage() {
    wx.chooseImage({
      count: 4, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths,
            avatar: res.tempFilePaths[0]
          })
        }
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      title: '召唤师',
      content: '确定要删除这段回忆吗？',
      cancelText: '再看看',
      confirmText: '再见',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },
  textareaAInput(e) {
    this.setData({
      textareaAValue: e.detail.value
    })
  },
  textareaBInput(e) {
    this.setData({
      textareaBValue: e.detail.value
    })
  },
  submit: async function (e) {
    var that = this
    console.log('form发生了submit事件，携带数据为：', e)
    // 上传图像到七牛云
    await that.upload()

    // 更新
    await that.update(e)
    wx.navigateBack({
      delta: 1
    });
  },
  upload() {
    var that = this
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: upload_file_url,
        filePath: that.data.avatar,
        name: 'avatarFile',
        header: {
          'content-type': 'multipart/form-data'
        }, // 设置请求的 header
        formData: { 'guid': "procomment" }, // HTTP 请求中其他额外的 form data
        success: function (res) {
          console.log("上传成功")
          console.log(res)
          resolve(res)
        },
        fail: function (err) {
          console.log("上传失败")
          console.log(err)
          reject(err)
        }
      })
    })
  },
  update(e) {
    var that = this
    let open_id = wx.getStorageSync("open_id");
    console.log("open_id: " + open_id)
    return new Promise((resolve, reject) => {
      wx.request({
        url: update_user_pet + "?contact=" + e.detail.value.contact +
          "&pet_type=" + that.data.pet_type[e.detail.value.type_variety[0]] +
          "&variety=" + that.data.multiArray[1][e.detail.value.type_variety[1]] +
          "&nick_name=" + e.detail.value.nick_name +
          "&gender=" + e.detail.value.gender +
          "&birthday=" + e.detail.value.birthday +
          "&avatar_url=" + that.data.avatar +
          "&open_id=" + open_id,
        data: {},
        header: { 'content-type': 'application/json' },
        method: 'post',
        dataType: 'json',
        responseType: 'text',
        success: (result) => {
          if (result.data > 0) {
            console.log("更新用户宠物信息成功")
          } else {
            console.log("更新用户宠物信息失败")
          }
          console.log(result)
          resolve(result)
        },
        fail: (err) => {
          console.log(err)
          console.log("更新用户宠物信息失败")
          reject(err)
        },
        complete: () => { }
      });
    })
  }
})