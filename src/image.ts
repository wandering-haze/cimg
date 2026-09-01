type ImageFormat = {
  mime: string
  extension: string
}

const PNG = [ 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a ]
const JPG = [ 0xff, 0xd8, 0xff ]
const GIF87a = [ 0x47, 0x49, 0x46, 0x38, 0x61 ]
const GIF89a = [ 0x47, 0x49, 0x46, 0x38, 0x39, 0x61 ]
const RIFF = [ 0x52, 0x49, 0x46, 0x46 ]
const WEBP = [ 0x57, 0x45, 0x42, 0x50 ]

function startsWithBytes(data: Uint8Array, signature: number[]): boolean {
  if (data.length < signature.length)
    return false

  return signature.every((byte, i) => data[i] === byte)
}

export function detectImageFormat(data: ArrayBuffer): ImageFormat | null {
  const bytes = new Uint8Array(data)

  // PNG
  if (startsWithBytes(bytes, PNG))
    return {
      mime: 'image/png',
      extension: 'png'
    }

  // JPG
  if (startsWithBytes(bytes, JPG))
    return {
      mime: 'image/jpeg',
      extension: 'jpg'
    }

  // GIF
  if (startsWithBytes(bytes, GIF87a) || startsWithBytes(bytes, GIF89a))
    return {
      mime: 'image/gif',
      extension: 'gif'
    }

  // WEBP
  if (startsWithBytes(bytes, RIFF) && startsWithBytes(bytes.subarray(8), WEBP))
    return {
      mime: 'image/webp',
      extension: 'webp'
    }

  return null
}