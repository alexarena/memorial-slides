export interface B2File {
  fileName: string
}

export default function slides(filesIn: B2File[]) {
  let files = filesIn

  function replaceFiles(replacementFiles: B2File[]) {
    files = replacementFiles
  }

  let state = {
    pos: 0,
    photo: files[0].fileName,
  }

  function getNext() {
    let nextPos = state.pos + 1
    if (nextPos >= files.length) {
      nextPos = 0
    }
    return {
      photo: files[nextPos].fileName,
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
