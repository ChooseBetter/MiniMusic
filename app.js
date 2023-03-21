// app.js
App({
  globalData:{
    screenWidth: 375, //屏幕宽度
    screenHeight: 667, // 屏幕高度
    statusHeight: 20, // 状态栏高度
    contentHeight: 500, 
  },
  onLaunch(){
    // 1.获取设备信息
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.screenWidth = res.screenWidth
        this.globalData.screenHeight = res.screenHeight
        this.globalData.statusHeight = res.statusBarHeight
        this.globalData.contentHeight = res.screenHeight - res.statusBarHeight - 44
      }
    })

    // 2.云开发能力进行初始化
    wx.cloud.init({
      env: "cloud1-8gru5xkr361997af"
    })
  }
})
