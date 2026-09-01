import { Elysia, file, t as T } from 'elysia'
import { jwt as jwtPlugin } from '@elysia/jwt'

import { detectImageFormat } from '@/image'
import { storageCleanup } from '@/file'
import * as config from '@/config'
import db from '@/database'

/* run once at the start, to remove old files (in case app wasn't launched for a long time) */
await storageCleanup()

/* set it on interval */
setInterval(() => storageCleanup().catch(err => console.error(`app: file cleanup failed: ${err}`)), config.CLEANUP_INTERVAL);

new Elysia()
  .use(jwtPlugin({ name: 'jwt', secret: config.JWT_SECRET, exp: '1d', alg: 'HS256', iss: 'cimg-api', aud: 'gmod-client' }))

  .get('/:file_id', ({ params: { file_id }, status }) => {
    const field = db.prepare('SELECT path FROM files WHERE id = ?').get(file_id) as { path: string } | null

    if (field === null)
      return status(404, 'Not Found')

    return file(field.path)
  })

  .put('/api/file', async ({ request, headers, jwt, status }) => {
    const authorization = headers['authorization']

    if (!authorization.startsWith('Bearer '))
      return status(401, 'Unauthorized')

    const token = authorization.slice(7)
    const payload = await jwt.verify(token)

    if (!payload || typeof payload.sub !== 'string')
      return status(401, 'Unauthorized')

    const contentType = headers['content-type']

    if (!contentType.startsWith('image/'))
      return status(415, 'Unsupported Media Type')

    const contentLength = Number(headers['content-length'])

    if (Number.isFinite(contentLength) && contentLength > config.MAX_FILE_SIZE)
      return status(413, 'Payload Too Large')

    const data = await request.arrayBuffer()

    if (data.byteLength > config.MAX_FILE_SIZE)
      return status(413, 'Payload Too Large')

    const format = detectImageFormat(data)

    if (format === null)
      return status(415, 'Unsupported Media Type')
    if (contentType !== format.mime)
      return status(409, 'Conflict')

    const steamId = payload.sub
    const id = crypto.randomUUID().replaceAll('-', '')
    const path = `images/${id}.${format.extension}`

    await Bun.write(path, data)

    try {
      db.prepare('INSERT INTO files (steamid, id, path, created_at) VALUES (?, ?, ?, ?)')
        .run(steamId, id, path, Math.floor(Date.now() / 1000))
    } catch (err) {
      await Bun.file(path).delete()
      throw err
    }

    return status(201, { id })
  }, {
    headers: T.Object({ ['authorization']: T.String(), ['content-type']: T.String(), ['content-length']: T.Optional(T.String()) })
  })

  .post('/api/token', async ({ body, headers, jwt, status }) => {
    if (headers['authorization'] !== `Bearer ${config.ROOT_SECRET}`)
      return status(401, 'Unauthorized')

    const token = await jwt.sign({ sub: body.steamId })
    return { token }
  }, {
    headers: T.Object({ ['authorization']: T.String() }),
    body: T.Object({ steamId: T.String({ pattern: '^7656119[0-9]{10}$' }) })
  })

  .listen({ hostname: config.HOSTNAME, port: config.PORT })