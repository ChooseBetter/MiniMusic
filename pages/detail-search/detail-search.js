// pages/detail-search/detail-search.js
import playerStore from '../../store/playerStore'

Page({
  data:{
    curTabIndex: 0,
    rankingInfos: {},
    curSongs:[]
  },
  onLoad(){
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on("acceptRankingInfos",(data)=>{
      this.setData({ rankingInfos: data.data })
    })
    this.setData({ curSongs: this.data.rankingInfos.newRanking.tracks })
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
  
  // 事件监听
  onTabTap(event){
    const curTabIndex = event.currentTarget.dataset.tabindex
    this.setData({ curTabIndex })
    let curTabName = ""
    if(curTabIndex === 0){
      curTabName = "newRanking"
    }else if(curTabIndex === 1){
      curTabName = "originRanking"
    }else{
      curTabName = "upRanking"
    }
    this.setData({ curSongs: this.data.rankingInfos[curTabName].tracks })
  },
  onItemTap(event){
    playerStore.setState('playSongList', this.data.curSongs)
    const id = event.currentTarget.dataset.item.id
    wx.navigateTo({
      url: `/pages/music-player/music-player?id=${id}`,
    })
  }
})