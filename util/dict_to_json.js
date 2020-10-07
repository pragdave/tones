const dict = {}
let count = 0

require('readline').createInterface({
  input: require('fs').createReadStream('assets/cedict_1_0_ts_utf-8_mdbg.txt')
})
.on('line', (line) => {
  if (!line.startsWith("#")) {
    const m = line.match(/\S+\s(\S+)\s\[(.*?)\]\s(.*)/)
    if (m) {
      chars= m[1]
      pinyin = addTones(chars, m[2])
      if (dict[chars]) {
        if (!(pinyin in dict[chars])) {
          dict[chars].push(pinyin)
        }
      }
      else
        dict[chars] = [pinyin]
    }
  }
})
.on('close', () => {
  const leaders = dictToLeaders(dict)
  console.log("var leaders = ", JSON.stringify(leaders), ";")
})

function dictToLeaders(dict) {
  const byLeader = {}
  Object.keys(dict).forEach(phrase => {
    leader = phrase[0]
    if (byLeader[leader])
      byLeader[leader].push([phrase, dict[phrase]])
    else
      byLeader[leader] = [[ phrase, dict[phrase] ]]
  })
  return byLeader
}

function addTones(chars, pinyin) {
  pinyin = pinyin.split(" ")
  if (chars.length != pinyin.length)
    return chars.split("")

  return chars.split("").map((char, i) => {
    const m = pinyin[i].match(/(\d$)/)
    if (!m) 
      return [ char, 0 ]
    else
      return  [ char, Number.parseInt(m[1]) ]
  })
}
