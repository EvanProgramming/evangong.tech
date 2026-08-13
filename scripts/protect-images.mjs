import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const COPYRIGHT = '© Evan Gong · evangong.tech'
const METADATA_COPYRIGHT = '(c) Evan Gong - evangong.tech'
const AUTHOR = 'Evan Gong'
const MAX_LONG_EDGE = 1600
const JPEG_QUALITY = 82
const WEBP_QUALITY = 82
const INCLUDED_DIRS = ['Photography', 'public/Photography', 'public/blog', 'public/awards']
const DUPLICATE_ASSET_PATHS = ['public/assets/demo/cs1.webp', 'public/assets/demo/cs2.webp', 'public/assets/demo/cs3.webp']
const MANIFEST_PATH = path.join(ROOT, 'photo-protection-manifest.json')
const BACKUP_BASE = process.env.PHOTO_ORIGINAL_BACKUP
  ? path.resolve(process.env.PHOTO_ORIGINAL_BACKUP)
  : path.join(os.homedir(), 'Documents', 'evangong.tech-originals')
const BACKUP_MARKER = '.photo-originals.json'

function usage() {
  console.log(`Usage: npm run images:protect -- --check|--apply

--check  verify that the tracked display assets are protected derivatives
--apply  back up originals outside the repository and write protected derivatives`)
}

function toRepoPath(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/')
}

function toAbsolute(repoPath) {
  return path.join(ROOT, ...repoPath.split('/'))
}

function isRaster(fileName) {
  return /\.(jpe?g|png|webp)$/i.test(fileName)
}

async function collectFiles(rootDir) {
  const files = []
  const entries = await fs.readdir(rootDir, { withFileTypes: true }).catch((error) => {
    if (error.code === 'ENOENT') return []
    throw error
  })

  for (const entry of entries) {
    const filePath = path.join(rootDir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await collectFiles(filePath))
    } else if ((entry.isFile() || entry.isSymbolicLink()) && isRaster(entry.name)) {
      const stats = await fs.stat(filePath).catch(() => null)
      if (stats?.isFile()) files.push(filePath)
    }
  }

  return files
}

async function collectRepoAssets() {
  const files = []
  for (const relativeDir of INCLUDED_DIRS) {
    files.push(...await collectFiles(toAbsolute(relativeDir)))
  }
  for (const relativePath of DUPLICATE_ASSET_PATHS) {
    const filePath = toAbsolute(relativePath)
    const stats = await fs.stat(filePath).catch(() => null)
    if (stats?.isFile()) files.push(filePath)
  }
  return files.sort()
}

async function collectApplyTargets() {
  const files = await collectRepoAssets()
  const manifest = await readManifest()
  const paths = new Set(files.map(toRepoPath))
  for (const asset of manifest?.assets || []) paths.add(asset.path)
  return [...paths].map(toAbsolute).sort()
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character])
}

function watermarkSvg(width, height) {
  const fontSize = Math.max(18, Math.round(Math.min(width, height) * 0.024))
  const padding = Math.max(14, Math.round(fontSize * 0.75))
  const boxWidth = Math.round(fontSize * 14.5)
  const boxHeight = Math.round(fontSize * 1.8)

  return Buffer.from(`<svg width="${boxWidth}" height="${boxHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${boxWidth}" height="${boxHeight}" rx="${Math.round(fontSize * 0.3)}" fill="#000" fill-opacity="0.22"/>
  <text x="${padding}" y="${Math.round(fontSize * 1.15)}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}px" fill="#fff" fill-opacity="0.78" letter-spacing="0.2">${escapeXml(COPYRIGHT)}</text>
</svg>`)
}

function outputFormat(repoPath) {
  const extension = path.extname(repoPath).toLowerCase()
  if (extension === '.webp') return 'webp'
  if (extension === '.png') return 'png'
  return 'jpeg'
}

async function renderDerivative(sourcePath, repoPath) {
  const sourceBuffer = await fs.readFile(sourcePath)
  const normalized = await sharp(sourceBuffer)
    .rotate()
    .resize({
      width: MAX_LONG_EDGE,
      height: MAX_LONG_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer({ resolveWithObject: true })

  const format = outputFormat(repoPath)
  const image = sharp(normalized.data)
    .composite([{ input: watermarkSvg(normalized.info.width, normalized.info.height), gravity: 'southeast' }])
    .withMetadata({
      orientation: 1,
      exif: {
        IFD0: {
          Artist: AUTHOR,
          Copyright: METADATA_COPYRIGHT,
          ImageDescription: 'Protected display derivative',
        },
      },
    })

  if (format === 'webp') {
    image.webp({ quality: WEBP_QUALITY, effort: 5 })
  } else if (format === 'png') {
    image.png({ compressionLevel: 9, adaptiveFiltering: true })
  } else {
    image.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
  }

  return image.toBuffer()
}

async function findLatestBackup() {
  const entries = await fs.readdir(BACKUP_BASE, { withFileTypes: true }).catch((error) => {
    if (error.code === 'ENOENT') return []
    throw error
  })
  const candidates = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const candidate = path.join(BACKUP_BASE, entry.name)
    try {
      await fs.access(path.join(candidate, BACKUP_MARKER))
      candidates.push(candidate)
    } catch {
      // Ignore unrelated directories in the private backup location.
    }
  }

  candidates.sort()
  return candidates.at(-1) || null
}

async function createBackup(repoFiles) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(BACKUP_BASE, timestamp)
  await fs.mkdir(backupDir, { recursive: true })
  const assets = []

  for (const repoFile of repoFiles) {
    const relativePath = toRepoPath(repoFile)
    const target = path.join(backupDir, ...relativePath.split('/'))
    const buffer = await fs.readFile(repoFile)
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, buffer)
    assets.push({ path: relativePath, sha256: sha256(buffer), bytes: buffer.length })
  }

  await fs.writeFile(path.join(backupDir, BACKUP_MARKER), JSON.stringify({
    createdAt: new Date().toISOString(),
    repository: ROOT,
    assets,
  }, null, 2) + '\n')
  return backupDir
}

async function getBackup(repoFiles) {
  const explicitBackup = process.env.PHOTO_ORIGINAL_BACKUP
  const backupDir = explicitBackup ? path.resolve(explicitBackup) : await findLatestBackup()
  if (!backupDir) return createBackup(repoFiles)

  const markerPath = path.join(backupDir, BACKUP_MARKER)
  await fs.access(markerPath)
  const marker = JSON.parse(await fs.readFile(markerPath, 'utf8'))
  const byHash = new Map(marker.assets.map((asset) => [asset.sha256, asset]))

  for (const repoFile of repoFiles) {
    const relativePath = toRepoPath(repoFile)
    const sourcePath = path.join(backupDir, ...relativePath.split('/'))
    try {
      await fs.access(sourcePath)
    } catch {
      const current = await fs.readFile(repoFile)
      const duplicate = byHash.get(sha256(current))
      if (!duplicate) throw new Error(`Original backup is missing ${relativePath}`)
      const duplicatePath = path.join(backupDir, ...duplicate.path.split('/'))
      await fs.mkdir(path.dirname(sourcePath), { recursive: true })
      await fs.copyFile(duplicatePath, sourcePath)
      marker.assets.push({ ...duplicate, path: relativePath })
    }
  }

  await fs.writeFile(markerPath, JSON.stringify(marker, null, 2) + '\n')
  return backupDir
}

async function readManifest() {
  try {
    return JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

async function check() {
  const files = await collectRepoAssets()
  const manifest = await readManifest()
  const records = new Map((manifest?.assets || []).map((asset) => [asset.path, asset]))
  const failures = []

  for (const filePath of files) {
    const relativePath = toRepoPath(filePath)
    const record = records.get(relativePath)
    const buffer = await fs.readFile(filePath)
    const metadata = await sharp(buffer).metadata()

    if (!record || record.publishedSha256 !== sha256(buffer)) {
      failures.push(`${relativePath}: missing or stale manifest fingerprint`)
    }
    if ((metadata.width || 0) > MAX_LONG_EDGE || (metadata.height || 0) > MAX_LONG_EDGE) {
      failures.push(`${relativePath}: ${metadata.width}x${metadata.height} exceeds ${MAX_LONG_EDGE}px`)
    }
  }

  if (records.size !== files.length) failures.push('manifest asset count does not match the protected asset count')
  console.log(`Protected asset check: ${files.length} files`)
  if (failures.length) {
    console.error(failures.map((failure) => `- ${failure}`).join('\n'))
    process.exitCode = 1
    return
  }
  console.log('Protected derivatives, dimensions, and fingerprints are valid.')
}

async function apply() {
  const repoFiles = await collectApplyTargets()
  if (!repoFiles.length) throw new Error('No protected image assets found.')

  const backupDir = await getBackup(repoFiles)
  const assets = []
  console.log(`Using private original backup: ${backupDir}`)

  for (const repoFile of repoFiles) {
    const relativePath = toRepoPath(repoFile)
    const sourcePath = path.join(backupDir, ...relativePath.split('/'))
    const sourceBuffer = await fs.readFile(sourcePath)
    const derivative = await renderDerivative(sourcePath, relativePath)
    const temporaryPath = `${repoFile}.protected.tmp`

    await fs.mkdir(path.dirname(repoFile), { recursive: true })
    await fs.writeFile(temporaryPath, derivative)
    await fs.rename(temporaryPath, repoFile)
    const metadata = await sharp(derivative).metadata()
    assets.push({
      path: relativePath,
      sourceSha256: sha256(sourceBuffer),
      sourceBytes: sourceBuffer.length,
      publishedSha256: sha256(derivative),
      publishedBytes: derivative.length,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    })
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify({
    version: 1,
    generatedAt: new Date().toISOString(),
    copyright: COPYRIGHT,
    maxLongEdge: MAX_LONG_EDGE,
    assets,
  }, null, 2) + '\n')

  const sourceBytes = assets.reduce((total, asset) => total + asset.sourceBytes, 0)
  const publishedBytes = assets.reduce((total, asset) => total + asset.publishedBytes, 0)
  console.log(`Protected ${assets.length} files: ${(sourceBytes / 1024 / 1024).toFixed(1)}MB → ${(publishedBytes / 1024 / 1024).toFixed(1)}MB`)
}

const command = process.argv[2]
if (command === '--check') {
  await check()
} else if (command === '--apply') {
  await apply()
} else {
  usage()
  process.exitCode = command === '--help' ? 0 : 1
}
