// pages/main-music/main-music.js
import { getMusicBanner, getSongMenuList } from '../../services/music'
import querySelect from '../../utils/query-select'
import { throttle } from 'underscore'
import recommendStore from '../../store/recommendStore'
import playerStore from '../../store/playerStore'
import rankingStore,{rankingsMap} from '../../store/rankingStore'

const querySelectThrottle = throttle(querySelect,100, { trailing: false })
const app = getApp()
 
Page({
  data:{
    searchValue:'',
    banners: [],
    bannerHeight: 0,
    screenWidth: 375,
    recommendSongs: [],
    // 歌单数据
    hotMenuList: [],
    recMenuList: [],
    // 巅峰榜数据
    isRankingData: false,
    rankingInfos: {},

    // 当前正在播放的歌曲
    currentSong: {},
    isPlaying: false,
  },
  onLoad(){
    this.fetchMusicBanner()
    this.fetchSongMenuList()

    // 发起action
    recommendStore.onState("recommendSongInfo", this.handleRecommendSongs)
    recommendStore.dispatch('fetchRecommendSongsAction')
    for(const key in rankingsMap){
      rankingStore.onState(key, this.getRankingHanlder(key))
    }
    rankingStore.dispatch('fetchRankingDataAction')
    
    playerStore.onStates(["currentSong", "isPlaying"], this.handleplayInfos)

    // 获取屏幕的尺寸
    this.setData({ screenWidth: app.globalData.screenWidth })
  },

  // 请求封装
  async fetchMusicBanner(){
    const res = await getMusicBanner()
    this.setData({ banners: res.banners })
  },
  async fetchSongMenuList(){
    getSongMenuList().then(res => {
      this.setData({ hotMenuList: res.playlists })
    })
    getSongMenuList('华语').then(res => {
      this.setData({ recMenuList: res.playlists })
    })
  },
  
  // 界面事件监听
  onSearchClick(){
    wx.navigateTo({ 
      url: '/pages/detail-search/detail-search',
      success:(res)=>{
        res.eventChannel.emit("acceptRankingInfos",{ data: this.data.rankingInfos })
      }
    })
  },
  onBannerImageLoad(event){
    // 获取Image组件的高度
    querySelectThrottle('.banner-image').then(res => {
      this.setData({ bannerHeight: res[0].height })
    })
  },
  onRecommendMoreClick(){
    wx.navigateTo({
      url: '/pages/detail-song/detail-song?type=recommend',
    })
  },
  onSongItemTap(event){
    const index = event.currentTarget.dataset.index
    playerStore.setState('playSongList', this.data.recommendSongs)
    playerStore.setState('playSongIndex', index)
  },
  // 开始/暂停
  onPlayPauseBtnTap(){
    playerStore.dispatch("playMusicStatusAction")
  },
  // 跳转到播放页面
  onPlayBarAlbumTap(){
    wx.navigateTo({
      url: '/pages/music-player/music-player',
    })
  },

  // 从Store获取数据
  handleRecommendSongs(value){
    if(!value.tracks) return 
    this.setData({ recommendSongs: value.tracks.slice(0,6) })
  },
  getRankingHanlder(ranking){
    return value => {
      if(!value.name) return
      this.setData({ isRankingData: true })
      const newRankingInfos = { 
        ...this.data.rankingInfos, 
        [ranking]: value
      }
      this.setData({ rankingInfos: newRankingInfos})
    }
  },
  handleplayInfos({ currentSong, isPlaying }){
    if(currentSong){
      this.setData({ currentSong })
    }
    if(isPlaying !== undefined){
      this.setData({ isPlaying })
    }
  },

  onUnLoad(){
    recommendStore.offState("recommendSongInfo", this.handleRecommendSongs)
    recommendStore.offState("newRanking", this.handleNewRanking)
    recommendStore.offState("originRanking", this.handleOriginRanking)
    recommendStore.offState("upRanking", this.handleUpRanking)
    playerStore.offStates(["currentSong", "isPlaying"], this.handleplayInfos)
  }
})