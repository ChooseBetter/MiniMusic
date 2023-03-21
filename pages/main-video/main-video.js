// pages/main-video/main-video.js
import { getTopMV } from '../../services/video'

Page({
  data:{
    videoList: [],
    offset: 0,
    hasMore: true
  },
  onLoad(){
    // 发送网络请求
    this.fetchToMV()
  },

  // 发送网络请求的方法
  async fetchToMV(){
    const res = await getTopMV(this.data.offset)
    const newVideoList = [...this.data.videoList, ...res.data]
    this.setData({ videoList: newVideoList })
    this.data.offset = this.data.videoList.length
    this.data.hasMore = res.hasMore
  },

  // 监听上拉和下拉功能
  onReachBottom(){
    if(!this.data.hasMore) return
    this.fetchToMV()
  },
  async onPullDownRefresh(){
    // 1.清空数据
    this.setData({ videoList: [] })
    this.data.offset = 0
    this.data.hasMore = true
    // 2.请求数据
    await this.fetchToMV()
    wx.stopPullDownRefresh()
  },

  // 事件监听
})