// pages/bluetooth/bluetooth.js

const regeneratorRuntime = require('../../lib/regenerator-runtime/runtime')

//获取应用实例  
var app = getApp();

var get_device_bluetooth_command = 'https://wetech.top:7443/petcage/get_device_bluetooth_command'
var get_service_id = 'https://wetech.top:7443/petcage/get_service_id'
var get_petcage_order_by_open_id = 'https://wetech.top:7443/petcage/get_petcage_order_by_open_id'
var close_order = 'https://wetech.top:7443/petcage/close_order'

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
      //&是我们定义的参数链接方式
      let deviceId = scene.split("@")[0];
      let deviceName = scene.split('@')[1];
      console.log("场景值：" + scene)
      this.setData({
        sceneDeviceId: deviceId,
        sceneDeviceName: deviceName
      })
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
  send_receive: function (e) {
    var that = this
    // 开关锁
    var command_type = e.currentTarget.dataset.command
    if (command_type == 'open') {
      console.log("开锁中...")
      that.send_command('open')
      that.setData({
        hidden: false
      })
      console.log("开锁完成...")
    } else if (command_type == 'close') {
      console.log("关锁中...")
      that.send_command('close')
      console.log("关锁完成...")
    } else if (command_type == 'settle') {
      console.log("结算中...")
      that.send_command('close')
      // 结算，调起微信支付接口
      var pay_amount = '1'

      // 修改订单状态
      that.close_order()
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
  send_command: function (command_type) {
    var that = this
    console.log("查看是否新订单中...")
    that.get_petcage_order_by_open_id()
    // 连接蓝牙设备
    console.log("打开蓝牙适配器中...")
    that.openBluetoothAdapter()
    console.log("获取蓝牙适配器状态中...")
    that.getBluetoothAdapterState()
    console.log("扫描蓝牙设备中...")
    that.startBluetoothDevicesDiscovery()
    console.log("获取蓝牙设备中...")
    that.getConnectedBluetoothDevices()
    console.log("连接蓝牙设备中...")
    that.connectTO()
    console.log("获取已连接蓝牙设备服务中...")
    that.getBLEDeviceServices()
    console.log("获取已连接蓝牙设备特征中...")
    that.getBLEDeviceCharacteristics()
    console.log("获取蓝牙设备指令集中...")
    that.get_device_bluetooth_command()
    console.log("向蓝牙设备发送命令中...")
    that.writeBLECharacteristicValue(command_type)
    console.log("关闭蓝牙中...")
    that.closeBLEConnection()
  },
  // 根据open_id获取order
  get_petcage_order_by_open_id: async function () {
    //查看该用户是否已存在订单
    let open_id = wx.getStorageSync("open_id")
    console.log("open_id: " + open_id)
    await app.request({
      url: get_petcage_order_by_open_id + "?open_id=" + open_id,
      method: 'post', //定义传到后台接受的是post方法还是get方法
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data.length)
        if (res.data.length != 0) { // 有未结束订单，继续使用该订单
          console.log("继续开锁")
        } else { // 无未结束订单，新增订单
          wx.navigateTo({
            url: '../order_add/order_add?device_id=' + that.data.sceneDeviceId,
          })
          return
        }
      },
      fail(err) {
        console.log("根据open_id查找订单失败，失败url：" + get_petcage_order_by_open_id + "?open_id=" + open_id)
        wx.showToast({
          title: '开锁失败请重试',
          icon: 'warn',
          duration: 1000
        })
        return
      }
    })
  },
  // 初始化蓝牙适配器  
  openBluetoothAdapter: async function () {
    var that = this
    await app.openBluetoothAdapter({
      success: function (res) {
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
        console.log(that.data)
      },
      fail: function (err) {
        console.log('初始化蓝牙适配器失败。')
        console.log(err)
      }
    })
  },
  // 本机蓝牙适配器状态  
  getBluetoothAdapterState: async function () {
    var that = this
    await app.getBluetoothAdapterState({
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
        console.log(that.data)
      },
      fail: function (err) {
        console.log('本机蓝牙适配器状态：')
        console.log(err)
      }
    })
  },
  //搜索设备  
  startBluetoothDevicesDiscovery: async function () {
    var that = this
    await app.startBluetoothDevicesDiscovery({
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
        console.log(that.data)
      },
      fail: function (err) {
        console.log('搜索设备')
        console.log(err)
      }
    })
  },
  // 获取所有已发现的设备  
  getConnectedBluetoothDevices: async function () {
    var that = this
    await app.getBluetoothDevices({
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
          if (res.devices[i].deviceId == that.data.sceneDeviceId && res.devices[i].deviceName == that.data.sceneDeviceName) {
            that.setData({
              msg: "连接设备：" + JSON.stringify(res.devices[i]),
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
        console.log(that.data)
      },
      fail: function (err) {
        console.log('获取设备')
        console.log(err)
      }
    })
  },
  //停止搜索周边设备  
  stopBluetoothDevicesDiscovery: async function () {
    var that = this
    await app.stopBluetoothDevicesDiscovery({
      success: function (res) {
        that.setData({
          msg: "停止搜索周边设备" + "/" + JSON.stringify(res.errMsg),
          search: res.discovering ? "在搜索。" : "未搜索。",
          status: res.available ? "可用。" : "不可用。",
        })
        console.log(that.data)
      },
      fail: function (err) {
        console.log('停止搜索设备')
        console.log(err)
      }
    })
  },
  //连接设备  
  connectTO: async function () {
    var that = this
    await app.createBLEConnection({
      // deviceId: e.currentTarget.id,
      deviceId: that.data.sceneDeviceId,
      success: function (res) {
        console.log(res);
        that.setData({
          // connectedDeviceId: e.currentTarget.id,
          // msg: "已连接" + e.currentTarget.id,
          connectedDeviceId: that.data.sceneDeviceId,
          msg: "已连接" + that.data.deviceId
        })
      },
      fail: function () {
        console.log("连接失败");
      },
      complete: function () {
        console.log(that.data)
        console.log("连接结束");
      }
    })
    console.log(that.data.connectedDeviceId);
  },
  // 获取连接设备的service服务  
  getBLEDeviceServices: async function () {
    var that = this
    await app.getBLEDeviceServices({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        console.log('device services:', JSON.stringify(res.services));
        that.setData({
          services: res.services,
          allservices: JSON.stringify(res.services),
        })
        console.log(that.data)
      },
      fail: function (err) {
        console.log('获取连接设备的service服务失败')
        console.log(err)
      }
    })
  },
  //获取连接设备的所有特征值  for循环获取不到值  
  getBLEDeviceCharacteristics: async function () {
    var that = this
    await app.request({
      url: get_service_id,
      success: function (res) {
        that.setData({
          serviceId: res.data
        })
      }
    })
    await app.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
      serviceId: that.serviceId,
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
        console.log(that.data)
        wx.showToast({
          title: '连接成功',
          icon: 'success',
          duration: 1000
        })
      },
      fail: function () {
        console.log("fail get characteristics.");
      },
      complete: function () {
        console.log("complete get characteristics.");
      }
    })
  },
  //断开设备连接  
  closeBLEConnection: async function () {
    var that = this
    await app.closeBLEConnection({
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        that.setData({
          connectedDeviceId: "",
        })
        console.log(that.data)
      }
    })
  },
  //监听input表单  
  inputTextchange: async function (e) {
    that.setData({
      inputValue: e.detail.value
    })
  },
  get_device_bluetooth_command: async function () {
    var that = this
    await app.request({
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
      },
      fail: function (err) {
        console.log('请求获取蓝牙设备命令集失败。')
        console.log(err)
        console.log("请求失败url：" + get_device_bluetooth_command + "?dvname=" + that.data.sceneDeviceName)
      }
    })
  },
  //发送命令  
  writeBLECharacteristicValue: async function (command_type) {
    var that = this
    console.log("-----调用notify开始-----")
    //监控变化
    await that.notifyBLECharacteristicValueChange()
    console.log("-----调用notify结束-----")
    // 这里的回调可以获取到 write 导致的特征值改变  
    await wx.onBLECharacteristicValueChange(function (res) {
      console.log('characteristic value comed:', that.ab2str(res.value))
    })
    var arr = that.data.command_list.msg[command_type];
    var buf = that.stringToBytes(arr)
    console.log("发送" + command_type + "指令: " + arr);
    console.log("writeServiceId", that.data.writeServiceId);
    console.log("writeCharacteristicsId", that.data.writeCharacteristicsId);
    await wx.writeBLECharacteristicValue({
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
        console.log(res)
        // 这里的回调可以获取到 write 导致的特征值改变  
        wx.onBLECharacteristicValueChange(function (res) {
          console.log('characteristic value comed:', that.ab2str(res.value))
        })
      },
      fail: function (err) {
        console.log("发送失败")
        console.log(err)
      }
    })
  },
  //启用低功耗蓝牙设备特征值变化时的 notify 功能  
  notifyBLECharacteristicValueChange: async function () {
    var that = this
    await wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能  
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
      serviceId: that.data.notifyServiceId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
      characteristicId: that.data.notifyCharacteristicsId,
      success: function (res) {
        console.log('notifyBLECharacteristicValueChange success', res.errMsg)
        console.log(that.data)
      },
      fail: function () {
        console.log('失败');
        console.log(that.data.notifyServiceId);
        console.log(that.data.notifyCharacteristicsId);
      },
    })
  },
  //接收消息  
  readBLECharacteristicValue: async function () {
    var that = this
    // 必须在这里的回调才能获取
    await wx.onBLECharacteristicValueChange(function (characteristic) {
      console.log('characteristic value comed:', characteristic)
    })
    console.log(that.data.readServiceId);
    console.log(that.data.readCharacteristicsId);
    console.log(that.ab2hex(that.data.value))
    await wx.readBLECharacteristicValue({
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
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  //关闭订单
  close_order: async function () {
    var that = this
    let open_id = wx.getStorageSync("open_id")
    console.log("open_id: " + open_id)
    await app.request({
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
            url: '../warn/index?order_id=' + that.data.order_id,
          })
        } else {
          wx.showToast({
            title: '结账失败，请重试',
            icon: 'warn',
            duration: 1000
          })
          // 结账失败，重试
        }
      }
    })
  }
})