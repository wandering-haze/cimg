import { Database } from 'bun:sqlite'

const db = new Database('data/cimg.db')

db.run('CREATE TABLE IF NOT EXISTS files (steamid TEXT NOT NULL, id TEXT NOT NULL PRIMARY KEY, path TEXT NOT NULL, created_at INTEGER NOT NULL);')

export default db