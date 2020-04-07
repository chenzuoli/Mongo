var util = require('../../../utils/util')
const app = getApp();
var get_user_info = 'https://localhost:7443/petcage/get_user_by_open_id'

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    index: null,
    picker: ['0-3', '4-8', '9-20', '20以上'],
    multiArray: [
      ['狗', '猫', '鱼', '鸟'],
      ['扁性动物', '线形动物', '环节动物', '软体动物', '节肢动物'],
    ],
    objectMultiArray: [
      [{
          id: 0,
          name: '狗'
        },
        {
          id: 1,
          name: '猫'
        },
        {
          id: 1,
          name: '鱼'
        },
        {
          id: 1,
          name: '鸟'
        }
      ],
      [{
          id: 0,
          name: '扁性动物'
        },
        {
          id: 1,
          name: '线形动物'
        },
        {
          id: 2,
          name: '环节动物'
        },
        {
          id: 3,
          name: '软体动物'
        },
        {
          id: 3,
          name: '节肢动物'
        }
      ]
    ],
    multiIndex: [0, 0, 0],
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
    now: ''
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
  PickerChange(e) {
    console.log(e);
    this.setData({
      index: e.detail.value
    })
  },
  MultiChange(e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },
  MultiColumnChange(e) {
    let data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        switch (data.multiIndex[0]) {
          case 0:
            data.multiArray[1] = ['扁性动物', '线形动物', '环节动物', '软体动物', '节肢动物'];
            data.multiArray[2] = ['猪肉绦虫', '吸血虫'];
            break;
          case 1:
            data.multiArray[1] = ['鱼', '两栖动物', '爬行动物'];
            data.multiArray[2] = ['鲫鱼', '带鱼'];
            break;
        }
        data.multiIndex[1] = 0;
        data.multiIndex[2] = 0;
        break;
      case 1:
        switch (data.multiIndex[0]) {
          case 0:
            switch (data.multiIndex[1]) {
              case 0:
                data.multiArray[2] = ['猪肉绦虫', '吸血虫'];
                break;
              case 1:
                data.multiArray[2] = ['蛔虫'];
                break;
              case 2:
                data.multiArray[2] = ['蚂蚁', '蚂蟥'];
                break;
              case 3:
                data.multiArray[2] = ['河蚌', '蜗牛', '蛞蝓'];
                break;
              case 4:
                data.multiArray[2] = ['昆虫', '甲壳动物', '蛛形动物', '多足动物'];
                break;
            }
            break;
          case 1:
            switch (data.multiIndex[1]) {
              case 0:
                data.multiArray[2] = ['鲫鱼', '带鱼'];
                break;
              case 1:
                data.multiArray[2] = ['青蛙', '娃娃鱼'];
                break;
              case 2:
                data.multiArray[2] = ['蜥蜴', '龟', '壁虎'];
                break;
            }
            break;
        }
        data.multiIndex[2] = 0;
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
  RegionChange: function(e) {
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
  submit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e)
    this.setData({
      allValue: e.detail.value
    })
    wx.showToast({
      title: '更新成功',
      icon: 'success',
      image: '',
      duration: 1500,
      mask: false,
      success: (result)=>{
        
      },
      fail: ()=>{},
      complete: ()=>{}
    });
    wx.navigateBack({
      delta: 1
    });
  }
})