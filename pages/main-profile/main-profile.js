// pages/main-profile/main-profile.js
import { menuCollection } from '../../database/index'
import menuStore from '../../store/menuStore'

Page({
  data:{
    isLogin: false,
    userInfo: {},
    tabs: [
      { name: "我的收藏", type: "favor" },
      { name: "我的喜欢", type: "like" },
      { name: "历史记录", type: "history" },
    ],

    isShowDialog: false,
    menuName: "",
    description: "",
    menuList: []
  },

  onLoad(){
    // 判断用户是否登录
    const openid = wx.getStorageSync('openid')
    const userInfo = wx.getStorageSync('userinfo')
    this.setData({ isLogin: !!openid })
    if(this.data.isLogin){
      this.setData({ userInfo })
    }

    // 2.共享歌单数据
    menuStore.onState("menuList", this.handleMenuList)
  },

  // 事件监听
  async onUserInfoTap(){
    // 1.获取用户的头像和昵称
    const profile = await wx.getUserProfile({
      desc: '获取您的头像和昵称',
    })

    // 2.获取用户的openid
    const loginRes = await wx.cloud.callFunction({
      name: "music-login"
    })
    const openid = loginRes.result.openid

    // 3.保存在本地
    wx.setStorageSync('openid', openid)
    wx.setStorageSync('userinfo', profile.userInfo)

    // 4.profile中的数据修改
    this.setData({ isLogin: true, userInfo: profile.userInfo })
  },

  onTabItemClick(event){
    if(!this.data.isLogin){
      this.onIsLogin()
      return
    }
    const item = event.currentTarget.dataset.item 
    
    wx.navigateTo({
      url: `/pages/detail-song/detail-song?type=profile&tabname=${item.type}&title=${item.name}`,
    })
  },

  onPlusTap(){
    if(!this.data.isLogin){
      this.onIsLogin()
      return
    }
    this.setData({ isShowDialog: true })
  },
  async onConfirmTap(){
    if(!this.data.isLogin){
      this.onIsLogin()
      return
    }
    // 1.获取歌单的名称
    const {menuName, description} = this.data
    if(!menuName){
      wx.showToast({
        title: '添加失败',
        icon: "error",
        complete: (res)=>{
          this.setData({ 
            menuName: "",
            description: ""
          })
        }
      })
      return
    }
    // 2.模拟歌单数据
    const menuRecord = {
      name: menuName,
      description: description,
      coverImgUrl: "/assets/images/content/music.png",
      creator:{
        avatarUrl: this.data.userInfo.avatarUrl,
        nickname: this.data.userInfo.nickName
      },
      subscribedCount: 0,
      songList: []
    }

    // 3.将歌单记录添加数据库
    const res = await menuCollection.add(menuRecord)
    if(res){
      wx.showToast({ 
        title: '添加歌单成功',
        complete: (res)=>{
          this.setData({ 
            menuName: "",
            description: ""
          })
        } 
      })
      menuStore.dispatch("fetchMenuListAction")
    }
  },

  onIsLogin(){
    wx.showToast({
      title: '请登录账号',
      icon: "error"
    })
    this.onUserInfoTap()
  },


  // 数据库
  handleMenuList(value){
    this.setData({ menuList: value })
  },
  onUnload(){
    menuStore.offState("menuList", this.handleMenuList)
  }
})