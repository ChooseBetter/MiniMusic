// pages/detail-song/detail-song.js
import recommendStore  from '../../store/recommendStore'
import rankingStore from '../../store/rankingStore'
import playerStore from '../../store/playerStore'
import menuStore from '../../store/menuStore'
import { getPlaylistDetail } from '../../services/music'

const db = wx.cloud.database()

Page({
  data:{
    type:"ranking",
    key:'newRanking',
    songInfo: {},
    id:'',
    menuList: [],
  },

  onLoad(options){
    // 获取store数据
    const type = options.type
    this.setData({ type })
    if(type === 'ranking'){
      const key = options.key
      this.data.key = key
      rankingStore.onState(key, this.handleRanking)
    }else if(type === 'recommend'){
      recommendStore.onState("recommendSongInfo", this.handleRanking)
    }else if(type === "menu"){
      if(options.id){
        // 系统歌单
        const id = options.id
        this.data.id = id
        this.fetchMenuSongInfo()
      }else{
        // 我的歌单
        const id = options._id
        this.data.id = id
        this.handleProfileMenu(options._id)
      }
    }else if(type === "profile"){ //个人中心tab
      const tabname = options.tabname
      const title = options.title
      this.handleProfileTabInfo(tabname,title)
    }
    // 我的歌单列表数据
    menuStore.onState("menuList", this.handleMenuList)
  },

  async fetchMenuSongInfo(){
    const res = await getPlaylistDetail(this.data.id)
    this.setData({ songInfo: res.playlist })
  },

  async handleProfileTabInfo(tabname,title){
    // 1.动态获取集合
    const collection = db.collection(`c_${tabname}`)
    // 2.获取数据的结果
    const res = await collection.get()
    this.setData({
      songInfo: {
        name: title,
        tracks: res.data
      }
    })
  },

  async handleProfileMenu(_id){
    const collection = db.collection('c_menu')
    const res = await collection.doc(_id).get()
    console.log(res);
    this.setData({ 
      songInfo: res.data
    })
  },

  // 事件监听
  onSongItemTap(){
    playerStore.setState('playSongList', this.data.songInfo.tracks)
  },

  // store共享数据
  handleRanking(value){
    this.setData({ songInfo: value })
    wx.setNavigationBarTitle({
      title: value.name,
    })
  },

  handleMenuList(value){
    this.setData({ menuList: value })
  },

  onUnload(){
    if(this.data.type === 'ranking'){
      rankingStore.offState(this.data.key, this.handleRanking)
    }else if(this.data.type === 'recommend'){
      recommendStore.offState("recommendSongInfo", this.handleRanking)
    }

    menuStore.offState("menuList", this.handleMenuList)
  },
})