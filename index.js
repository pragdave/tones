let input = document.getElementById("input")
let result = document.getElementById("result")
let textarea = input.getElementsByTagName("textarea")[0]

document.getElementById("colorize-tones")
  .addEventListener("click", (ev) => {
    if (ev.target.checked)
      result.classList.add("color-marks")
    else
      result.classList.remove("color-marks")
})

document.getElementById("colorize-chars")
  .addEventListener("click", (ev) => {
    if (ev.target.checked)
      result.classList.add("color-chars")
    else
      result.classList.remove("color-chars")
})

input.addEventListener("submit", convertText)

function convertText(event) {
  event.preventDefault()
  const text = textarea.value
  let offset = 0
  let op = []

  while (offset < text.length) {
    let leader = text[offset]
    let candidates = leaders[leader]
    if (!candidates) {
      op.push([leader, 0])
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
          pinyin[0].forEach(pair => op.push([...pair]))
          found = true
          offset += phrase.length
        }
      }
    }
  }
  applySandhi(op)
  addToResult(op)
}

function applySandhi(op) {
  
  // tone 3 followed by tone 3 => tone 2
  let i = op.length - 1
  while (i > 0) {
    console.log(i, "is", op[i][1])
    if (op[i][1] == 3) {
      while (i > 0 && op[i-1][1] == 3) {
        i = i - 1
        console.log("changing", i)
        op[i][1] = 2
      }
    }
    i = i - 1
  }

  // When followed by a 4th tone, 不 (bù) changes to 2nd tone (bú).
  for (i = 0; i < op.length-1; i++) { // note we don't check the last
    if (op[i][0] == "不"  && op[i+1][1] == 4)
      op[i][1] = 2
  }

  // When followed by a 4th tone, 一 (yī) changes to 2nd tone (yí). When
  // followed by any other tone, 一 (yī) changes to 4th tone (yì).
  for (i = 0; i < op.length-1; i++) { // note we don't check the last
    if (op[i][0] == "一") {
      let nextTone = op[i+1][1]
      console.log("at", i, "next tone", nextTone, JSON.stringify(op[i+1]))
      if (nextTone == 4) op[i][1] = 2
      else if (nextTone > 0) op[i][1] = 4
    }
  }
}

const Subscript = [
  "",
  "₁",
  "₂",
  "₃",
  "₄",
  "₅"
]

function addToResult(op) {
  const pairs = op.map(([char, tone]) => {
    return `<span class="char tone-${tone}">${char}</span><span class="mark tone-${tone}">${Subscript[tone]}</span>`
  })
  result.innerHTML = pairs.join("")
}


