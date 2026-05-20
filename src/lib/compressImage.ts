// Compresión de imágenes en el navegador con Canvas.
// Sin dependencias externas. Devuelve un Blob JPEG.

export async function compressImage(
  file: File,
  { maxSize = 1280, quality = 0.8 }: { maxSize?: number; quality?: number } = {},
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)

  let { width, height } = bitmap
  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  const canvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement('canvas'), { width, height })
  // @ts-expect-error union de canvas
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo obtener contexto 2D')
  ctx.drawImage(bitmap, 0, 0, width, height)

  if (canvas instanceof OffscreenCanvas) {
    return await canvas.convertToBlob({ type: 'image/jpeg', quality })
  }
  return await new Promise<Blob>((resolve, reject) => {
    ;(canvas as HTMLCanvasElement).toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob falló'))),
      'image/jpeg',
      quality,
    )
  })
}
