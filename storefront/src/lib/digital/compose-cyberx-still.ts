import "server-only"

import { join } from "node:path"

import sharp from "sharp"

const SAMPLE_WIDTH = 280

type Point = { x: number; y: number }

function svgPath(points: Point[]) {
  return points
    .map(({ x, y }, index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ")
}

async function tintedLogo(width: number, color: [number, number, number]) {
  const source = join(process.cwd(), "public", "xyz-london-logo.png")
  const { data, info } = await sharp(source)
    .resize({ width })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  for (let index = 0; index < data.length; index += 4) {
    data[index] = color[0]
    data[index + 1] = color[1]
    data[index + 2] = color[2]
    data[index + 3] = Math.round(data[index + 3] * 0.82)
  }
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer()
}

/**
 * Detect the distinctive blue/violet CyberX shell. We reject ambiguous images
 * instead of drawing effects on a face, background, or unrelated garment.
 */
async function jacketOutline(image: Buffer) {
  const { data, info } = await sharp(image)
    .resize({ width: SAMPLE_WIDTH })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const total = width * height
  const candidate = new Uint8Array(total)
  const visited = new Uint8Array(total)
  const queue = new Int32Array(total)

  for (let y = Math.floor(height * 0.25); y < Math.floor(height * 0.9); y++) {
    for (let x = Math.floor(width * 0.05); x < Math.floor(width * 0.95); x++) {
      const index = y * width + x
      const offset = index * channels
      const red = data[offset]
      const green = data[offset + 1]
      const blue = data[offset + 2]
      if (
        Math.max(red, green, blue) - Math.min(red, green, blue) > 22 &&
        blue > red * 0.98 &&
        blue > green * 0.98 &&
        blue > 54
      ) {
        candidate[index] = 1
      }
    }
  }

  let best: number[] = []
  for (let index = 0; index < total; index++) {
    if (!candidate[index] || visited[index]) continue
    let head = 0
    let tail = 1
    queue[0] = index
    visited[index] = 1
    const component: number[] = []
    while (head < tail) {
      const current = queue[head++]
      component.push(current)
      const x = current % width
      const y = Math.floor(current / width)
      const neighbors = [
        x > 0 ? current - 1 : -1,
        x < width - 1 ? current + 1 : -1,
        y > 0 ? current - width : -1,
        y < height - 1 ? current + width : -1,
      ]
      for (const next of neighbors) {
        if (next >= 0 && candidate[next] && !visited[next]) {
          visited[next] = 1
          queue[tail++] = next
        }
      }
    }
    if (component.length > best.length) best = component
  }

  const left = new Int32Array(height).fill(width)
  const right = new Int32Array(height).fill(-1)
  let minX = width
  let maxX = 0
  let minY = height
  let maxY = 0
  for (const index of best) {
    const x = index % width
    const y = Math.floor(index / width)
    left[y] = Math.min(left[y], x)
    right[y] = Math.max(right[y], x)
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }

  const coverage = best.length / total
  const span = (maxX - minX) / width
  if (
    coverage < 0.08 ||
    coverage > 0.55 ||
    span < 0.35 ||
    span > 0.85 ||
    minY < height * 0.2 ||
    minY > height * 0.5 ||
    (minX + maxX) / 2 < width * 0.3 ||
    (minX + maxX) / 2 > width * 0.7
  ) {
    throw new Error("CyberX jacket could not be located reliably in the try-on image")
  }

  const points: { left: Point; right: Point }[] = []
  for (let y = minY; y <= maxY; y += 5) {
    const values: number[] = []
    const ends: number[] = []
    for (let row = Math.max(minY, y - 2); row <= Math.min(maxY, y + 2); row++) {
      if (right[row] >= 0) {
        values.push(left[row])
        ends.push(right[row])
      }
    }
    if (!values.length) continue
    values.sort((a, b) => a - b)
    ends.sort((a, b) => a - b)
    points.push({
      left: { x: values[Math.floor(values.length / 2)], y },
      right: { x: ends[Math.floor(ends.length / 2)], y },
    })
  }
  if (points.length < 10) throw new Error("CyberX jacket outline is incomplete")
  return { width, height, minX, maxX, minY, maxY, points }
}

export async function composeCyberxStill(image: Buffer): Promise<Buffer> {
  const metadata = await sharp(image).metadata()
  const width = metadata.width
  const height = metadata.height
  if (!width || !height || width > 4096 || height > 4096) {
    throw new Error("Unsupported CyberX try-on image size")
  }
  const outline = await jacketOutline(image)
  const scaleX = width / outline.width
  const scaleY = height / outline.height
  const toPixels = ({ x, y }: Point) => ({ x: x * scaleX, y: y * scaleY })
  const left = outline.points.map(({ left }) => toPixels(left))
  const right = outline.points.map(({ right }) => toPixels(right))
  const shell = svgPath([...left, ...[...right].reverse()]) + " Z"
  const leftTrail = svgPath(left.slice(2, -5))
  const rightTrail = svgPath(right.slice(2, -5))
  const top = outline.minY * scaleY
  const leftLogoX = Math.max(width * 0.03, outline.minX * scaleX - width * 0.02)
  const rightLogoX = Math.min(width * 0.9, outline.maxX * scaleX - width * 0.13)
  const leftLogoY = top - height * 0.01
  const rightLogoY = top - height * 0.025
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="shift" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#55eaff" stop-opacity=".07"/>
        <stop offset=".55" stop-color="#d65cff" stop-opacity=".09"/>
        <stop offset="1" stop-color="#55eaff" stop-opacity="0"/>
      </linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>
    <path d="${shell}" fill="url(#shift)"/>
    <path d="${leftTrail}" fill="none" stroke="#60ebff" stroke-width="8" stroke-linecap="round" opacity=".25" filter="url(#glow)"/>
    <path d="${rightTrail}" fill="none" stroke="#ec7aff" stroke-width="8" stroke-linecap="round" opacity=".25" filter="url(#glow)"/>
    <path d="${leftTrail}" fill="none" stroke="#8ff6ff" stroke-width="2" stroke-linecap="round" opacity=".48"/>
    <path d="${rightTrail}" fill="none" stroke="#eeadfa" stroke-width="2" stroke-linecap="round" opacity=".48"/>
  </svg>`)
  const logoWidth = Math.max(50, Math.round(width * 0.11))
  const [cyanLogo, magentaLogo] = await Promise.all([
    tintedLogo(logoWidth, [141, 246, 255]),
    tintedLogo(logoWidth, [233, 164, 245]),
  ])
  return sharp(image)
    .composite([
      { input: svg },
      { input: cyanLogo, left: Math.round(leftLogoX), top: Math.round(leftLogoY) },
      { input: magentaLogo, left: Math.round(rightLogoX), top: Math.round(rightLogoY) },
    ])
    .png()
    .toBuffer()
}
