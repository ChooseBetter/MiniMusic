
// [00:58.65]
const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/
export function parseLyric(lrcString){
  const lyricInfos = []
  // 根据换行符，获取每一行的数据
  const lyricLines = lrcString.split("\n")
  for(const lineString of lyricLines){
    // 通过正则获取时间
    const results = timeReg.exec(lineString)
    if(!results) continue
    const minute = results[1] * 60 * 1000
    const second = results[2] * 1000
    const mSecond = results[3].length === 2 ? results[3] * 10 : results[3] * 1
    const time = minute + second + mSecond 
    // 将数据的时间去掉，获取歌词
    const text = lineString.replace(timeReg, "")
    lyricInfos.push({ time, text }) 
  }
  return lyricInfos
}