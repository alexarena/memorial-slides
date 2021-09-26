export interface B2File {
  fileName: string
}

function secondsFromNow(n: number) {
  const t = new Date()
  t.setSeconds(t.getSeconds() + n)
  return t
}

export default function slides(filesIn: B2File[]) {
  let files = filesIn

  function replaceFiles(replacementFiles: B2File[]) {
    files = replacementFiles
  }

  let state = {
    pos: 0,
    playAt: new Date(),
    photo: files[0].fileName,
  }

  function getNext() {
    let nextPos = state.pos + 1
    if (nextPos >= files.length) {
      nextPos = 0
    }
    return {
      photo: files[nextPos].fileName,
      playAt: secondsFromNow(5),
      pos: nextPos,
    }
  }

  setInterval(() => {
    state = getNext()
    console.log('Current photo', state.photo)
  }, 5000)

  for (const file of files) {
    console.log('- ', file.fileName)
  }

  function slide() {
    return {
      current: state,
    }
  }

  return { slide, replaceFiles }
}
