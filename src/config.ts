function assertVar<T>(name: string, parser: (value: string) => T): T {
  const val = Bun.env[name]

  if (val === undefined)
    throw Error(`assertVar: ${name} is not configured in environment properly.`)

  return parser(val)
}

export const ROOT_SECRET = assertVar('CIMG_ROOT_SECRET', String)

export const JWT_SECRET = assertVar('CIMG_ELY_JWT_SECRET', String)

export const HOSTNAME = assertVar('CIMG_ELY_HOSTNAME', String)
export const PORT = assertVar('CIMG_ELY_PORT', Number)

export const MAX_FILE_SIZE = assertVar('CIMG_FS_MAX_SIZE', Number)
export const FILE_LIFETIME = assertVar('CIMG_FS_LIFETIME', Number)
export const CLEANUP_INTERVAL = assertVar('CIMG_FS_CLEANUP_INTERVAL', Number)