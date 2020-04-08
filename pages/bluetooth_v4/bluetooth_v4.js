// pages/bluetooth/bluetooth.js

//获取应用实例  
var app = getApp();
var prom = require("../../utils/prom.js")
const api = app.globalData.api

var get_device_bluetooth_command = 'https://wetech.top:7443/petcage/get_device_bluetooth_command'
var get_service_id = 'https://wetech.top:7443/petcage/get_service_id'
var get_petcage_order_by_open_id = 'https://wetech.top:7443/petcage/get_petcage_order_by_open_id'
var close_order = 'https://wetech.top:7443/petcage/close_order'
var get_device_info = 'https://wetech.top:7443/petcage/get_device_info'

Page({
  data: {
    status: "",
    search: "",
    msg: "",
    sceneDeviceId: "",
    sceneDeviceName: "",
    device: "",
    connectedDeviceId: "", //已连接设备uuid  
    services: "", // 连接设备的服务  
    characteristics: "", // 连接设备的状态值  
    writeServiceId: "", // 可写服务uuid  
    writeCharacteristicsId: "", //可写特征值uuid  
    readServiceId: "", // 可读服务uuid  
    readCharacteristicsId: "", //可读特征值uuid  
    notifyServiceId: "", //通知服务UUid  
    notifyCharacteristicsId: "", //通知特征值UUID 
    command_list: "", // 蓝牙设备命令集
    inputValue: "",
    characteristics1: "", // 连接设备的状态值  
    hidden: true,
    service_id: "",
    order_id: "",
    is_add: "0",
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
  },
  ab2str: function (buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  },
  str2ab: function (str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  },
  // 字符串转byte
  stringToBytes: function (str) {
    var array = new Uint8Array(str.length);
    for (var i = 0, l = str.length; i < l; i++) {
      array[i] = str.charCodeAt(i);
    }
    console.log(array);
    return array.buffer;
  },
  // ArrayBuffer转string
  ab2hex: function (buffer) {
    var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function (bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('')
  },

  onLoad: function (options) {
    console.log(options)
    //获取场景id（设备id和设备名称）
    if (options.scene) {
      let scene = decodeURIComponent(options.scene);
      console.log("场景值：" + scene)
      this.get_device_info(scene)
    } else {
      console.log("没有获取到scene场景值")
    }
    if (wx.openBluetoothAdapter) {
      wx.openBluetoothAdapter()
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示  
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  //开锁、关锁、结算  
  send_receive: async function (e) {
    var that = this
    // 开关锁
    var command_type = e.currentTarget.dataset.command
    if (command_type == 'open') {
      console.log("开锁中...")
      await that.send_command('open')
      that.setData({
        hidden: false
      })
      console.log("开锁完成...")
    } else if (command_type == 'close') {
      console.log("关锁中...")
      await that.send_command('close')
      console.log("关锁完成...")
    } else if (command_type == 'settle') {
      console.log("结算中...")
      await that.send_command('close')
      // 结算，调起微信支付接口
      var pay_amount = '1'

      // 修改订单状态
      await that.close_order(pay_amount)
      console.log("结算完成...")
    } else {
      wx.showToast({
        title: '服务器错误，请重新登录！',
        icon: 'warn',
        duration: 2000
      })
    }
  },
  // 发送指令
  send_command: async function (command_type) {
    var that = this
    await api.showLoading() // 显示loading
    await that.get_service_id(1) // 请求数据
    await that.get_petcage_order_by_open_id(2)
    if (that.data.is_add == '1') {
      await api.hideLoading() // 等待请求数据成功后，隐藏loading
      return
    }
    await that.openBluetoothAdapter(5)
    await that.getBluetoothAdapterState(6)
    await that.startBluetoothDevicesDiscovery(7)
    await that.getConnectedBluetoothDevices(8)
    await that.stopBluetoothDevicesDiscovery(9)
    await that.connectTO(10)
    await that.getBLEDeviceServices(11)
    await that.getBLEDeviceCharacteristics(12)
    await that.getDeviceBluetoothCommand(13)
    await that.notifyBLECharacteristicValueChange(14)
    await that.writeBLECharacteristicValue(15, command_type)
    await that.closeBLEConnection(16)
    // await api.hideLoading() // 等待请求数据成功后，隐藏loading
  },
  get_device_info: function (scene) {
    var that = this
    wx.request({
      url: get_device_info + "?id=" + scene,
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res)
        if (res.data.data == null) {
          console.log("根据场景id获取设备信息失败，无该设备")
        } else {
          that.setData({
            sceneDeviceId: res.data.data.device_id,
            sceneDeviceName: res.data.data.device_name
          })
        }
      },
      fail(err) {
        console.log("根据场景id获取设备信息失败，请求失败")
        console.log(err)
      }
    })
  },
  get_service_id(e) {
    console.log(e)
    return new Promise((resolve, reject) => {
      api.getData(get_service_id, {
        x: '',
        y: ''
      }).then((res) => {
        this.setData({
          service_id: res
        })
        console.log(res)
        resolve(res)
      }).catch((err) => {
        console.error(err)
        reject(err)
      })
    })
  },
  // 根据open_id获取order
  get_petcage_order_by_open_id: function (e) {
    var that = this
    console.log(e)
    //查看该用户是否已存在订单
    let open_id = wx.getStorageSync("open_id")
    console.log("open_id: " + open_id)
    return new Promise((resolve, reject) => {
      api.postData(get_petcage_order_by_open_id + "?open_id=" + open_id, {
        open_id: open_id
      }).then((res) => {
        console.log(res.data)
        if (res.data.length != 0) { // 有未结束订单，继续使用该订单
          console.log("继续开锁")
          that.setData({
            order_id: res.data[0].order_id,
            is_add: '0'
          })
          resolve(res)
        } else { // 无未结束订单，新增订单
          that.setData({
            is_add: '1'
          })
          wx.navigateTo({
            url: '../order_add/order_add?device_id=' + that.data.sceneDeviceId,
          })
          resolve(res)
        }
      }).catch((err) => {
        console.log(err)
        console.log("根据open_id查找订单失败，失败url：" + get_petcage_order_by_open_id + "?open_id=" + open_id)
        wx.showToast({
          title: '开锁失败请重试',
          icon: 'warn',
          duration: 1000
        })
        reject(err)
      })
      console.log(that.data)
    })
  },
  // 初始化蓝牙适配器  
  openBluetoothAdapter: function (e) {
    var that = this
    console.log(e)
    return new Promise((resolve, reject) => {
      wx.openBluetoothAdapter({
        success(res) {
          that.setData({
            msg: "初始化蓝牙适配器成功！" + JSON.stringify(res),
          })
          //监听蓝牙适配器状态  
          wx.onBluetoothAdapterStateChange(function (res) {
            that.setData({
              search: res.discovering ? "在搜索。" : "未搜索。",
              status: res.available ? "可用。" : "不可用。",
            })
          })
          console.log(res)
          resolve(res)
        },
        fail(err) {
          that.setData({
            msg: "初始化蓝牙适配器失败。",
          })
          console.log('初始化蓝牙适配器失败。')
          console.log(err)
          reject(err)
        }
      })
      console.log(that.data)
    })
  },
  // 本机蓝牙适配器状态  
  getBluetoothAdapterState: function (e) {
    var that = this
    console.log(e)
    return new Promise((resolve, reject) => {
      wx.getBluetoothAdapterState({
        success: function (res) {
          that.setData({
            msg: "本机蓝牙适配器状态" + "/" + JSON.stringify(res.errMsg),
            search: res.discovering ? "在搜索。" : "未搜索。",
            status: res.available ? "可用。" : "不可用。",
          })
          //监听蓝牙适配器状态  
          wx.onBluetoothAdapterStateChange(function (res) {
            that.setData({
              search: res.discovering ? "在搜索。" : "未搜索。",
              status: res.available ? "可用。" : "不可用。",
            })
          })
          console.log(res)
          resolve(res)
        },
        fail: function (err) {
          console.log('本机蓝牙适配器状态：')
          console.log(err)
          reject(err)
        }
      })
      console.log(that.data)
    })
  },
  //搜索设备  
  startBluetoothDevicesDiscovery: function (e) {
    var that = this
    console.log(e)
    return new Promise((resolve, reject) => {
      wx.startBluetoothDevicesDiscovery({
        success: function (res) {
          that.setData({
            msg: "搜索设备" + JSON.stringify(res),
          })
          //监听蓝牙适配器状态  
          wx.onBluetoothAdapterStateChange(function (res) {
            that.setData({
              search: res.discovering ? "在搜索。" : "未搜索。",
              status: res.available ? "可用。" : "不可用。",
            })
          })
          console.log(res)
          resolve(res)
        },
        fail: function (err) {
          console.log('搜索设备')
          console.log(err)
          reject(err)
        }
      })
      console.log(that.data)
    })
  },
  // 获取所有已发现的设备  
  getConnectedBluetoothDevices: function (e) {
    var that = this
    console.log(e)
    return new Promise((resolve, reject) => {
      wx.getBluetoothDevices({
        success: function (res) {
          //是否有已连接设备  
          wx.getConnectedBluetoothDevices({
            success: function (res) {
              console.log(res)
              console.log(JSON.stringify(res.devices));
              if (res.devices.length != 0) {
                that.setData({
                  connectedDeviceId: res.deviceId
                })
              }
            }
          })
          for (var i = 0; i < res.devices.length; i++) {
            if (res.devices[i].deviceId == that.data.sceneDeviceId && res.devices[i].name == that.data.sceneDeviceName) {
              that.setData({
                msg: "可连接设备：" + JSON.stringify(res.devices[i]),
                device: res.devices[i]
              })
            }
          }
          //监听蓝牙适配器状态  
          wx.onBluetoothAdapterStateChange(function (res) {
            that.setData({
              search: res.discovering ? "在搜索。" : "未搜索。",
              status: res.available ? "可用。" : "不可用。",
            })
          })
          console.log(res)
          resolve(res)
        },
        fail: function (err) {
          console.log('获取设备')
          console.log(err)
          reject(err)
        }
      })
      console.log(that.data)
    })
  },
  //停止搜索周边设备  
  stopBluetoothDevicesDiscovery: function (e) {
    var that = this
    console.log(e)
    return new Promise((resolve, reject) => {
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          that.setData({
            msg: "停止搜索周边设备" + "/" + JSON.stringify(res.errMsg),
            search: res.discovering ? "在搜索。" : "未搜索。",
            status: res.available ? "可用。" : "不可用。",
          })
          console.log(res)
          resolve(res)
        },
        fail: function (err) {
          console.log('停止搜索设备')
          console.log(err)
          reject(err)
        }
      })
      console.log(that.data)
    })
  },
  //连接设备  
  connectTO: function (e) {
    var that = this
    console.log(e)
    return new Promise((resolve, reject) => {
      wx.createBLEConnection({
        deviceId: that.data.sceneDeviceId,
        success: function (res) {
          console.log(res);
          that.setData({
            connectedDeviceId: that.data.sceneDeviceId,
            msg: "已连接" + that.data.sceneDeviceId
          })
          wx.showToast({
            title: '连接成功',
            icon: 'success',
            duration: 1000
          })
          resolve(res)
        },
        fail: function (err) {
          console.log("连接失败");
          console.log(err)
          reject(err)
        },
        complete: function () {
          console.log("连接结束");
        }
      })
      console.log(that.data)
    })
  },
  // 获取连接设备的service服务  
  getBLEDeviceServices: function (e) {
    var that = this
    console.log(e)
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceServices({
        // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
        deviceId: that.data.connectedDeviceId,
        success: function (res) {
          console.log('device services:', JSON.stringify(res.services));
          that.setData({
            services: res.services,
            allservices: JSON.stringify(res.services),
          })
          console.log(res)
          resolve(res)
        },
        fail: function (err) {
          console.log('获取连接设备的service服务失败')
          console.log(err)
          reject(err)
        }
      })
      console.log(that.data)
    })
  },
  //获取连接设备的所有特征值  for循环获取不到值  
  getBLEDeviceCharacteristics: function (e) {
    var that = this
    console.log(e)
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceCharacteristics({
        // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
        deviceId: that.data.connectedDeviceId,
        // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
        serviceId: that.data.service_id,
        success: function (res) {
          for (var i = 0; i < res.characteristics.length; i++) {
            if (res.characteristics[i].properties.notify) {
              that.setData({
                notifyServiceId: that.data.services[1].uuid,
                notifyCharacteristicsId: res.characteristics[i].uuid,
              })
            }
            if (res.characteristics[i].properties.write) {
              that.setData({
                writeServiceId: that.data.services[1].uuid,
                writeCharacteristicsId: res.characteristics[i].uuid,
              })
              that.setData({
                readServiceId: that.data.services[1].uuid,
                readCharacteristicsId: res.characteristics[i].uuid,
              })
            }
          }
          console.log('device getBLEDeviceCharacteristics:', res.characteristics);
          that.setData({
            characteristics: JSON.stringify(res.characteristics),
          })
          console.log(res)
          resolve(res)
        },
        fail: function (err) {
          console.log("fail get characteristics.");
          console.log(err)
          reject(err)
        },
        complete: function () {
          console.log("complete get characteristics.");
        }
      })
      console.log(that.data)
    })
  },
  // 获取与蓝牙设备交互命令集
  getDeviceBluetoothCommand: function (e) {
    var that = this
    console.log(e)
    return new Promise((resolve, reject) => {
      wx.request({
        url: get_device_bluetooth_command + "?dvname=" + that.data.sceneDeviceName,
        data: {
          dvname: that.data.sceneDeviceName
        },
        method: 'post', //定义传到后台接受的是post方法还是get方法
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          console.log(res.data)
          if (res.data.data == null) {
            console.log("请求获取蓝牙设备命令集失败。")
            return
          }
          that.setData({
            command_list: res.data.data
          })
          console.log(res)
          resolve(res)
        },
        fail: function (err) {
          console.log('请求获取蓝牙设备命令集失败。')
          console.log(err)
          console.log("请求失败url：" + get_device_bluetooth_command + "?dvname=" + that.data.sceneDeviceName)
          reject(err)
        }
      })
      console.log(that.data)
    })
  },
  //启用低功耗蓝牙设备特征值变化时的 notify 功能  
  notifyBLECharacteristicValueChange: function (e) {
    var that = this
    console.log(e)
    return new Promise((resolve, reject) => {
      wx.notifyBLECharacteristicValueChange({
        state: true, // 启用 notify 功能  
        // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
        deviceId: that.data.connectedDeviceId,
        // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
        serviceId: that.data.notifyServiceId,
        // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
        characteristicId: that.data.notifyCharacteristicsId,
        success: function (res) {
          console.log('notifyBLECharacteristicValueChange success', res.errMsg)
          wx.onBLECharacteristicValueChange(function (res) {
            console.log('characteristic value comed:', that.ab2str(res.value))
          })
          console.log(res)
          resolve(res)
        },
        fail: function (err) {
          console.log('失败');
          console.log(err)
          reject(err)
        },
      })
      console.log(that.data)
    })
  },
  //发送命令  
  writeBLECharacteristicValue: function (e, command_type) {
    var that = this
    console.log(e)
    let command_name = ''
    if (command_type == 'open') {
      command_name = '开锁'
    } else if (command_type == 'close') {
      command_name = '关锁'
    } else if (command_type == 'settle') {
      command_name = '结账'
    }
    return new Promise((resolve, reject) => {
      var arr = that.data.command_list.msg[command_type];
      var buf = that.stringToBytes(arr)
      console.log("发送" + command_type + "指令: " + arr);
      console.log("writeServiceId", that.data.writeServiceId);
      console.log("writeCharacteristicsId", that.data.writeCharacteristicsId);
      wx.writeBLECharacteristicValue({
        // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
        deviceId: that.data.connectedDeviceId,
        // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
        serviceId: that.data.writeServiceId,
        // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
        characteristicId: that.data.writeCharacteristicsId,
        // 这里的value是ArrayBuffer类型  
        value: buf,
        success: function (res) {
          console.log('writeBLECharacteristicValue success', res.errMsg)
          // 这里的回调可以获取到 write 导致的特征值改变  
          wx.onBLECharacteristicValueChange(function (res) {
            console.log('characteristic value comed:', that.ab2str(res.value))
          })

          wx.showToast({
            title: command_name + '成功',
            icon: 'success',
            duration: 1000
          })
          console.log(res)
          resolve(res)
        },
        fail: function (err) {
          console.log("发送失败")
          console.log(err)
          wx.showToast({
            title: command_name + '失败',
            icon: 'warn',
            duration: 1000
          })
          reject(err)
        }
      })
      console.log(that.data)
    })
  },
  //接收消息  
  readBLECharacteristicValue: function (e) {
    var that = this
    console.log(e)
    return new Promise((resolve, reject) => {
      // 必须在这里的回调才能获取
      wx.onBLECharacteristicValueChange(function (characteristic) {
        console.log('characteristic value comed:', characteristic)
      })
      console.log(that.data.readServiceId);
      console.log(that.data.readCharacteristicsId);
      console.log(that.ab2hex(that.data.value))
      wx.readBLECharacteristicValue({
        // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
        deviceId: that.data.connectedDeviceId,
        // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
        serviceId: that.data.readServiceId,
        // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
        characteristicId: that.data.readCharacteristicsId,
        success: function (res) {
          console.log('readBLECharacteristicValue:', res.errMsg);
          console.log(res)
          console.log(that.ab2hex(res.value))
          resolve(res)
        },
        fail: function (err) {
          console.log("读取失败")
          console.log(err)
          reject(err)
        }
      })
      console.log(that.data)
    })
  },
  //断开设备连接  
  closeBLEConnection: function (e) {
    var that = this
    console.log(e)
    return new Promise((resolve, reject) => {
      wx.closeBLEConnection({
        deviceId: that.data.connectedDeviceId,
        success: function (res) {
          that.setData({
            connectedDeviceId: "",
          })
          console.log(res)
          resolve(res)
        },
        fail(err) {
          console.log("断开连接失败")
          console.log(err)
          reject(err)
        }
      })
      console.log(that.data)
    })
  },
  //监听input表单  
  inputTextchange: async function (e) {
    that.setData({
      inputValue: e.detail.value
    })
  },
  //关闭订单
  close_order: function (pay_amount) {
    var that = this
    console.log("结算中...")
    let order_id = that.data.order_id
    if (order_id == null) {
      order_id = wx.getStorageSync('order_id')
    }
    return new Promise((resolve, reject) => {
      let open_id = wx.getStorageSync("open_id")
      console.log("open_id: " + open_id)
      wx.request({
        url: close_order + "?amount=" + pay_amount + "&open_id=" + open_id + "&order_id=" + that.data.order_id,
        method: 'post', //定义传到后台接受的是post方法还是get方法
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          if (res.data > 0) {
            wx.showToast({
              title: '结账成功',
              icon: 'success',
              duration: 1000
            })
            //结账完成，进入订单反馈界面
            wx.navigateTo({
              url: '../feedback/feedback?order_id=' + that.data.order_id,
            })
          } else {
            wx.showToast({
              title: '结账失败请重试',
              icon: 'warn',
              duration: 1000
            })
            // 结账失败，重试
            console.log("失败url：" + close_order + "?amount=" + pay_amount + "&open_id=" + open_id + "&order_id=" + that.data.order_id)
          }
          console.log(res)
          resolve(res)
        },
        fail(err) {
          console.log("关闭订单失败")
          console.log(err)
          reject(err)
        }
      })
      console.log(that.data)
    })
  }
})