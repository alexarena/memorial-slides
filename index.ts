import { Application, Router, send } from 'https://deno.land/x/oak/mod.ts'
import { encode } from 'https://deno.land/std/encoding/base64.ts'
import { B2_APP_KEY_ID, B2_APP_KEY } from './config.ts'
import slides, { B2File } from './slides.ts'

const BUCKET_NAME = '8fd3db0ca3e91cd07ec70f11'

async function authenticateB2() {
  const headers = new Headers()
  headers.append(
    'Authorization',
    `Basic: ${encode(B2_APP_KEY_ID + ':' + B2_APP_KEY)}`
  )

  const res = await fetch(
    'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
    { method: 'GET', headers }
  )

  const json = await res.json()

  const apiUrl = json.apiUrl as string
  console.info(`Success getting B2 auth details ${apiUrl}`)

  const authorizationToken = json.authorizationToken as string

  return {
    apiUrl,
    authorizationToken,
  }
}

const b2Credentials = await authenticateB2()

async function b2Request(endpoint: string, method?: 'POST') {
  const headers = new Headers()
  headers.append('Authorization', b2Credentials.authorizationToken)

  const res = await fetch(`${b2Credentials.apiUrl}/b2api/v2/${endpoint}`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ bucketId: BUCKET_NAME }),
  })
  const json = await res.json()
  return json
}

async function fetchPhotosFromB2() {
  const filesResp = await b2Request('b2_list_file_names')
  const files: B2File[] = filesResp.files
  return files
}

const files = await fetchPhotosFromB2()
const slideshow = slides(files)

async function generateB2UploadUrl() {
  const json = await b2Request('b2_get_upload_url')

  console.log(json)

  const url = json.uploadUrl as string
  const authToken = json.authorizationToken as string
  return { url, authToken }
}

const app = new Application()

const router = new Router()
router.get('/upload-params', async (context) => {
  const params = await generateB2UploadUrl()

  context.response.body = params
})

router.get('/next-slide', async (context) => {
  context.response.body = slideshow.slide()
})

router.get('/refresh-photos', async (context) => {
  console.log('Refreshing photos')
  const newFiles = await fetchPhotosFromB2()
  slideshow.replaceFiles(newFiles)
  context.response.status = 200
})

app.use(router.routes())
app.use(router.allowedMethods())

app.use(async (context) => {
  console.log(`${Deno.cwd()}/static`)
  await send(context, context.request.url.pathname, {
    root: `${Deno.cwd()}/static`,
    index: 'index.html',
  })
})

console.log('App running!')
await app.listen({ port: 5000 })
