var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('assets/cedict_1_0_ts_utf-8_mdbg.txt')
});

const dict = {}
let count = 0

lineReader.on('line', (line) => {
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

lineReader.on('close', () => {
  const leaders = dictToLeaders(dict)
  const text = process.argv[2]
  let offset = 0

  while (offset < text.length) {
    let leader = text[offset]
    let candidates = leaders[leader]
    if (!candidates) {
      console.log(text)
      offset++
    }
    else {
      if (!candidates.sorted) {
        candidates.sort((a,b) => {
          return b[0].length - a[0].length
        })
        candidates.sorted = true
      }

      let found = false

      for (let i = 0; !found && i < candidates.length; i++) {
        const [phrase, pinyin] = candidates[i]
        if (text.startsWith(phrase, offset)) {
          console.log(pinyin[0])
          found = true
          offset += phrase.length
        }
      }
    }
  }
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

const subscripts = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅"
}

function addTones(chars, pinyin) {
  pinyin = pinyin.split(" ")
  if (chars.length != pinyin.length)
    return chars.split("")

  return chars.split("").map((char, i) => {
    const m = pinyin[i].match(/(\d$)/)
    if (!m) 
      return char
    else
      return  `${char}${subscripts[m[1]]}`
  })
    .join(" ")
}
