import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const CATEGORIES = ['Beijing', 'Chaoshan', 'Miscellaneous', 'Paris']
const SRC_ROOT = '/Users/evangong/Desktop'
const DEST_ROOT = path.resolve('public/Photography')

async function compressCategory(name) {
  const srcDir = path.join(SRC_ROOT, `${name}Photos`)
  const destDir = path.join(DEST_ROOT, name)
  await fs.mkdir(destDir, { recursive: true })

  const entries = await fs.readdir(srcDir)
  const files = entries.filter((f) => /\.(jpe?g|png|webp)$/i.test(f))

  let saved = 0
  let beforeTotal = 0
  let afterTotal = 0

  for (const file of files) {
    const srcPath = path.join(srcDir, file)
    const destPath = path.join(destDir, file)
    const before = await fs.stat(srcPath)
    beforeTotal += before.size

    await sharp(srcPath)
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true, mozjpeg: true })
      .toFile(destPath + '.tmp')

    await fs.rename(destPath + '.tmp', destPath)
    const after = await fs.stat(destPath)
    afterTotal += after.size
    saved += before.size - after.size
  }

  console.log(
    `${name}: ${files.length} images, ${(beforeTotal / 1024 / 1024).toFixed(1)}MB → ${(afterTotal / 1024 / 1024).toFixed(1)}MB (saved ${(saved / 1024 / 1024).toFixed(1)}MB)`
  )
}

async function main() {
  await fs.rm(DEST_ROOT, { recursive: true, force: true })
  for (const category of CATEGORIES) {
    await compressCategory(category)
  }
  const total = await fs.readdir(DEST_ROOT)
  console.log(`Done. Compressed categories: ${total.join(', ')}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
