import { HYEventStore } from 'hy-event-store'
import { parseLyric } from '../utils/parse-lyric'
import { getSongDetail, getSongLyric   } from '../services/player'
import { historyCollection } from "../database/index"

// 创建播放器
export const audioContext = wx.createInnerAudioContext()

const playerStore = new HYEventStore({
  state:{
    playSongList: [],
    playSongIndex: 0,

    id: 0,
    currentSong: {},
    currentTime: 0,  // 当前歌曲进度时长
    durationTime: 0, // 当前歌曲总时长
    lyricInfos: [],  // 歌词信息
    currentLyricText: "", // 当前歌词文本
    currentLyricIndex: -1, // 当前歌词下标
    isFirstPlay: true, // 是否第一次播放
    isPlaying: false,
    playModeIndex: 0, // 0:顺序播放 1:单曲循环 2:随机播放
  },

  actions: {
    playMusicWithSongIdAction(ctx, id){
      // 0.数据重置
      ctx.currentSong = {}
      ctx.currentTime = 0
      ctx.durationTime = 0
      ctx.currentLyricIndex = 0
      ctx.currentLyricText = ''
      ctx.lyricInfos = []
      
      // 1.保存id
      ctx.id = id
      ctx.isPlaying = true

      // 2.1.根据id获取歌曲的详情
      getSongDetail(id).then(res=>{
        ctx.currentSong = res.songs[0]
        ctx.durationTime = res.songs[0].dt

        historyCollection.add(ctx.currentSong)
      })
      
      // 2.2.根据id获取歌词信息
      getSongLyric(id).then(res=>{
        const lrcString = res.lrc.lyric
        const lyricInfos = parseLyric(lrcString)
        ctx.lyricInfos = lyricInfos
      })

      // 3.播放当前歌曲 
      audioContext.stop()
      audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
      audioContext.autoplay = true

      // 4.监听播放的进度 
      if(ctx.isFirstPlay){
        ctx.isFirstPlay = false

        audioContext.onTimeUpdate(() => {
          // 1.获取当前播放的时间
          ctx.currentTime = audioContext.currentTime * 1000

          // 2.匹配正确的歌词
          if(!ctx.lyricInfos.length) return
          let index = ctx.lyricInfos.length - 1
          for(let i = 0; i < ctx.lyricInfos.length; i++){
            const info = ctx.lyricInfos[i]
            if(info.time > audioContext.currentTime * 1000){
              index = i - 1
              break
            }
          }
          if(index === ctx.currentLyricIndex ) return

          // 3.获取歌词的索引和文本
          // 4.改变歌词滚动页面的位置
          const currentLyricText = ctx.lyricInfos[index].text
          ctx.currentLyricText = currentLyricText
          ctx.currentLyricIndex = index
        })
        audioContext.onWaiting(() => {
          audioContext.pause()
        })
        audioContext.onCanplay(() => {
          audioContext.play()
        })
        audioContext.onEnded(() => {
          if(audioContext.loop) return
          // 切换下一首歌曲
          this.dispatch("playNewMusicAction")
        })
      }
    },

    // 播放/暂停
    playMusicStatusAction(ctx){
      if(!audioContext.paused){
        audioContext.pause()
        ctx.isPlaying = false
      }else{
        audioContext.play()
        ctx.isPlaying = true
      }
    },

    // 切换模式
    changePlayModeAction(ctx){
      // 1.计算新的模式
      let modeIndex = ctx.playModeIndex
      modeIndex = modeIndex + 1
      if(modeIndex === 3) modeIndex = 0

      // 设置是否是单曲循环
      if(modeIndex === 1){
        audioContext.loop = true
      }else{
        audioContext.loop = false
      }
      // 2.保存当前模式
      ctx.playModeIndex = modeIndex
    },

    // 改变歌曲
    playNewMusicAction(ctx, isNext = true){
      // 1.获取之前数据
      const length = ctx.playSongList.length
      let index = ctx.playSongIndex
      // 2.获取最新下一首歌的索引
      switch (ctx.playModeIndex) {
        case 1:
        case 0: // 循环播放
          index = isNext ? index + 1 : index - 1
          if(index === length) index = 0
          if(index === -1) index = length - 1 
          break
        case 2: // 随机播放
          index = Math.floor(Math.random() * length)
          break
      }

      // 3.获取下一首歌的信息
      const newSong = ctx.playSongList[index]
      // 播放新歌曲
      this.dispatch("playMusicWithSongIdAction", newSong.id)
      // 4.保存索引
      ctx.playSongIndex = index
    }
  }
})

export default playerStore