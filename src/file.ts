import * as config from '@/config'
import db from '@/database'

export async function storageCleanup() {
  const cutoff = Math.floor(Date.now() / 1000) - config.FILE_LIFETIME

  const files = db.prepare('SELECT id, path FROM files WHERE created_at < ?').all(cutoff) as { id: string, path: string }[]

  for (const file of files) {
    try {
      await Bun.file(file.path).delete()
    } catch (err) {
      console.error(`file/cleanup: failed to delete file ${file.id}: ${err}`)
      continue
    }

    db.prepare('DELETE FROM files WHERE id = ?').run(file.id)
  }

  if (files.length > 0)
    console.log(`file/cleanup: ${files.length} files cleaned up`)
}