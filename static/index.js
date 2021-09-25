const uploader = document.getElementById('upload')

uploader.addEventListener('change', onSelectFiles, false)
async function onSelectFiles() {
  console.log('File select!')
  console.log(uploader)
  const files = uploader.files /* now you can work with the file list */
  const file = files[0]
  console.log('file', file)
  console.log(files)

  const reader = new FileReader()
  reader.onload = async function () {
    const hash = CryptoJS.SHA1(CryptoJS.enc.Latin1.parse(reader.result))
    console.log(hash.toString())

    const uploadParams = await fetch('/upload-params').then((res) => res.json())
    console.log('up', uploadParams)

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

    await fetch('/refresh-photos')

    console.log(json)
  }
  reader.readAsBinaryString(file)
}
