// pages/music-player/music-player.js
import { throttle } from 'underscore' 
import playerStore,{ audioContext } from '../../store/playerStore'

const app = getApp()
const modeNames = ["order","repeat","random"]

Page({
  data:{
    stateKeys: ["id","currentSong","durationTime","currentTime","lyricInfos","currentLyricText","currentLyricIndex","isPlaying","playModeIndex"],

    id: 0,
    currentSong: {},
    currentTime: 0,  // 当前歌曲进度时长
    durationTime: 0, // 当前歌曲总时长
    lyricInfos: [],  // 歌词信息
    currentLyricText: "", // 当前歌词文本
    currentLyricIndex: -1, // 当前歌词下标

    isPlaying: true,

    playSongIndex: 0,
    playSongList: [],
    isFirstPlay: true,

    playModeName:"order",

    pageTitles:[ "歌曲","歌词"], 
    currentPage: 0, // 0为歌曲，1为歌词
    contentHeight: 0, // 内容高度
    sliderValue: 0, // 当前歌曲进度
    isSliderChanging: false,
    isWaiting :false,
    lyricScrollTop: 0, // 设置滚动条
  },
  onLoad(options){
    // 0.获取设备信息
    this.setData({
      contentHeight: app.globalData.contentHeight
    })
    // 1.获取传入的id
    const id = options.id
    // 2.根据id播放歌曲
    if(id){
      playerStore.dispatch("playMusicWithSongIdAction",id)
    }

    // 5.获取store共享数据
    playerStore.onStates(["playSongList","playSongIndex"], this.getPlaySongInfoHandler)
    playerStore.onStates(this.data.stateKeys, this.getPlayerInfosHandler)
    console.log(this.data.playSongList);
  }, 
  
  // 更新进度条
  updateProgress: throttle(function(currentTime){
    if(this.data.isSliderChanging ) return
    // 1.记录当前时间
    // 2.修改sliderValue
    const sliderValue = currentTime / this.data.durationTime * 100
    this.setData({ currentTime, sliderValue })
  }, 800, { leading: false, trailing: false}),

  // 事件监听
  // 返回上一页
  onNavBackTap(){
    wx.navigateBack()
  },
  // 轮播图切换
  onSwiperChange(event){
    this.setData({ currentPage: event.detail.current })
  },
  // 导航栏切换
  onNavTabItemTap(event){
    const index = event.currentTarget.dataset.index
    this.setData({ currentPage: index })
  },

  // 进度条滑块
  onSliderChange(event){
    this.data.isWaiting = true
    setTimeout(()=>{
      this.data.isWaiting = false
    },1500)
    // 1.获得点击滑块位置对应的值
    const value = event.detail.value
    // 2.计算出播放的位置时间
    const currentTime = value / 100 * this.data.durationTime
    // 3.设置播放器，播放时间
    audioContext.seek(currentTime / 1000)
    this.setData({ currentTime, isSliderChanging: false, sliderValue: value })
    audioContext.autoplay = true
    this.setData({ isPlaying: true })
  },
  // 时间随着滑块位置变化
  onSliderChanging: throttle(function(event){
    // 1.获得点击滑块位置对应的值
    const value = event.detail.value
    // 2.计算出播放的位置时间
    const currentTime = value / 100 * this.data.durationTime
    this.setData({ currentTime })
    // 3.当前正在滑动
    this.data.isSliderChanging = true
  },100),

  // 播放/暂停
  onPlayOrPauseTap(){
    playerStore.dispatch('playMusicStatusAction')
  },
  // 上一首
  onPreBtnTap(){
    playerStore.dispatch("playNewMusicAction", false)
  },
  // 下一首
  onNextBtnTap(){
    playerStore.dispatch("playNewMusicAction")
  },
  // 模式切换
  onModeBtnTap(){
    playerStore.dispatch("changePlayModeAction")
  },

  // store共享数据
  getPlaySongInfoHandler({playSongList,playSongIndex}){
    if(playSongList){
      this.setData({ playSongList })
    }
    if(playSongIndex !== undefined){
      this.setData({ playSongIndex })
    }
  },
  getPlayerInfosHandler({
    id,currentSong,durationTime,currentTime,lyricInfos,currentLyricText,currentLyricIndex,isPlaying,playModeIndex
  }){
    if(id !== undefined){
      this.setData({ id })
    }
    if(currentSong !== undefined){
      this.setData({ currentSong })
    }
    if(durationTime !== undefined){
      this.setData({ durationTime })
    }
    if(currentTime !== undefined){
      // 根据当前时间改变进度
      this.updateProgress( currentTime )
    }
    if(lyricInfos !== undefined){
      this.setData({ lyricInfos })
    }
    if(currentLyricText !== undefined){
      this.setData({ currentLyricText })
    }
    if(currentLyricIndex !== undefined){ 
      // 修改lyricScrollTop
      this.setData({ currentLyricIndex, lyricScrollTop: currentLyricIndex * 35 })
    }
    if(isPlaying !== undefined){ 
      // 修改isPlaying
      this.setData({ isPlaying })
    }
    if(playModeIndex !== undefined){ 
      this.setData({ playModeName: modeNames[playModeIndex] })
    }
  },
  onUnload(){
    playerStore.offStates(["playSongList", "playSongIndex"], this.getPlaySongInfoHandler)
    playerStore.offStates(this.data.stateKeys, this.getPlayerInfosHandler)
  }
})