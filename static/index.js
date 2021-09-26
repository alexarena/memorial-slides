const uploader = document.getElementById('upload')
const totalCount = document.getElementById('total-count')
const uploadedCount = document.getElementById('uploaded-count')
const uploadProgress = document.getElementById('upload-progress')

const sectionComplete = document.getElementById('section-complete')
const sectionUpload = document.getElementById('section-upload')

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function () {
      return resolve(reader.result)
    }
    reader.onerror = function () {
      return reject(reader.error)
    }
    reader.readAsBinaryString(file)
  })
}

uploader.addEventListener('change', onSelectFiles, false)
async function onSelectFiles() {
  console.log('File select!')
  uploadProgress.style.display = 'block'

  totalCount.innerText = uploader.files.length

  let i = 1
  for (const file of uploader.files) {
    const contents = await readFile(file)
    const hash = CryptoJS.SHA1(CryptoJS.enc.Latin1.parse(contents))

    const uploadParams = await fetch('/upload-params').then((res) => res.json())

    const res = await fetch(uploadParams.url, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': file.type,
        'Content-Length': file.size,
        Authorization: uploadParams.authToken,
        'X-Bz-File-Name': new Date().getTime() + '.jpg',
        'X-Bz-Content-Sha1': hash,
      }),
      body: file,
    })

    const json = await res.json()
    console.log('Upload result', json)

    await fetch('/refresh-photos')

    uploadedCount.innerText = i++
  }

  sectionComplete.style.display = 'block'
  sectionUpload.style.display = 'none'
}
