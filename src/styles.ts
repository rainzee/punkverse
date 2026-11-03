import { adjust, clamp, lerp, lum, parse, ramp, type Rgba } from './color'
import type { Painter } from './painter'
import type { Rng } from './rng'

export type Shape = 'square' | 'gap' | 'circle' | 'rounded' | 'brick' | 'glyph' | 'dither' | 'halftone'

type Lookup = (x: number, y: number) => Rgba | null

/** 渲染风格, 描述背景, 逐像素调色, 像素形状与后期效果 */
export interface Style {
  id: string
  name: string
  desc: string
  background: (p: Painter) => void
  color?: (c: Rgba, x: number, y: number, at: Lookup) => Rgba | null
  shape?: Shape
  empty?: string
  glow?: number
  extrude?: { depth: number; shade: number }
  padding?: number
  post?: (ctx: CanvasRenderingContext2D, size: number, rng: Rng) => void
}

const rgba = (r: number, g: number, b: number, a = 1): Rgba => ({ r, g, b, a })
const WHITE = rgba(255, 255, 255)
const isInk = (c: Rgba) => lum(c) < 0.1 && c.a > 0.5

function gridLines(p: Painter, n: number, color: string, width = 1) {
  for (let i = 0; i <= n; i++) {
    const v = (i * p.size) / n
    p.line(v, 0, v, p.size, color, width)
    p.line(0, v, p.size, v, color, width)
  }
}

function scanlines(ctx: CanvasRenderingContext2D, size: number, a: number) {
  const step = Math.max(2, size / 160)
  ctx.shadowBlur = 0
  ctx.fillStyle = `rgba(0,0,0,${a})`
  for (let y = 0; y < size; y += step * 2) ctx.fillRect(0, y, size, step)
}

function vignette(ctx: CanvasRenderingContext2D, size: number, a: number) {
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.25, size / 2, size / 2, size * 0.75)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, `rgba(40,20,0,${a})`)
  ctx.shadowBlur = 0
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
}

function grain(ctx: CanvasRenderingContext2D, size: number, rng: Rng, a: number) {
  const dot = Math.max(1, size / 240)
  ctx.shadowBlur = 0
  for (let i = 0; i < (size * size) / (dot * dot * 18); i++) {
    ctx.fillStyle = rng() < 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`
    ctx.fillRect(rng() * size, rng() * size, dot, dot)
  }
}

function glitch(ctx: CanvasRenderingContext2D, size: number, rng: Rng) {
  const img = ctx.getImageData(0, 0, size, size)
  const src = new Uint8ClampedArray(img.data)
  const d = img.data
  const k = Math.max(1, Math.round((size / 24) * 0.35))
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const r = (y * size + clamp(x + k, 0, size - 1)) * 4
      const b = (y * size + clamp(x - k, 0, size - 1)) * 4
      d[i] = src[r]
      d[i + 2] = src[b + 2]
      d[i + 3] = Math.max(src[i + 3], src[r + 3], src[b + 3])
    }
  }
  const row = new Uint8ClampedArray(size * 4)
  for (let s = 0; s < 7; s++) {
    const y0 = Math.floor(rng() * size)
    const h = Math.ceil((rng() * size) / 22)
    const shift = Math.round((rng() - 0.5) * (size / 7))
    for (let y = y0; y < Math.min(size, y0 + h); y++) {
      row.set(d.subarray(y * size * 4, (y + 1) * size * 4))
      for (let x = 0; x < size; x++) {
        const sx = (((x - shift) % size) + size) % size
        d.set(row.subarray(sx * 4, sx * 4 + 4), (y * size + x) * 4)
      }
    }
  }
  ctx.putImageData(img, 0, 0)
  scanlines(ctx, size, 0.12)
}

function sparkles(ctx: CanvasRenderingContext2D, size: number, rng: Rng) {
  const u = size / 24
  ctx.shadowBlur = u * 0.6
  ctx.shadowColor = '#fff6c8'
  ctx.fillStyle = '#fffbe6'
  for (let i = 0; i < 9; i++) {
    const x = Math.floor(rng() * 24) * u + u / 2
    const y = Math.floor(rng() * 24) * u + u / 2
    const s = u * (0.12 + rng() * 0.12)
    ctx.fillRect(x - s / 2, y - s * 2, s, s * 4)
    ctx.fillRect(x - s * 2, y - s / 2, s * 4, s)
  }
  ctx.shadowBlur = 0
}

const GB = ['#0f380f', '#306230', '#8bac0f', '#e0f8cf']
const GOLD = ['#1f1200', '#6b430a', '#c08a26', '#ffd86b', '#fff6d6']
const THERMAL = ['#0b0730', '#3b0a7a', '#9a157a', '#e0334a', '#f8862c', '#ffd94a', '#fffbe0']

export const STYLES: Style[] = [
  {
    id: 'classic',
    name: '经典',
    desc: '原汁原味的 24×24 像素',
    background: (p) => p.fill('#638596'),
  },
  {
    id: 'neon',
    name: '霓虹',
    desc: '赛博朋克辉光描边',
    background: (p) => {
      p.fill('#0b0418')
      gridLines(p, 12, 'rgba(255,43,214,0.12)', Math.max(1, p.size / 400))
    },
    color: (c) => (isInk(c) ? parse('#00f0ff') : { ...adjust(c, { satAdd: 0.5, light: 0.58 }), a: 0.55 }),
    glow: 0.5,
  },
  {
    id: 'gameboy',
    name: 'Game Boy',
    desc: '四阶绿色液晶屏',
    background: (p) => p.fill('#9bbc0f'),
    color: (c) => {
      const l = lum(c)
      return parse(GB[l < 0.15 ? 0 : l < 0.4 ? 1 : l < 0.62 ? 2 : 3])
    },
    shape: 'gap',
  },
  {
    id: 'onebit',
    name: '1-bit 抖动',
    desc: '经典 Mac 风格的有序抖动',
    background: (p) => {
      p.fill('#f2efe6')
      const d = p.size / 96
      for (let y = 0; y < 96; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < 96; x += 4) p.rect(x * d, y * d, d, d, '#1a1a1a')
    },
    shape: 'dither',
  },
  {
    id: 'pastel',
    name: '马卡龙',
    desc: '柔和粉彩与圆角像素',
    background: (p) => p.linear(['#ffd6e8', '#d4f1ff']),
    color: (c) => (isInk(c) ? parse('#5b4a8a') : lerp(c, { ...WHITE, a: c.a }, 0.42)),
    shape: 'rounded',
  },
  {
    id: 'negative',
    name: '负片',
    desc: '反相的底片效果',
    background: (p) => p.fill('#9c7a69'),
    color: (c) => rgba(255 - c.r, 255 - c.g, 255 - c.b, c.a),
  },
  {
    id: 'blueprint',
    name: '蓝图',
    desc: '工程制图的线稿',
    background: (p) => {
      p.fill('#13407a')
      gridLines(p, 24, 'rgba(255,255,255,0.08)', Math.max(1, p.size / 600))
      gridLines(p, 6, 'rgba(255,255,255,0.16)', Math.max(1, p.size / 300))
    },
    color: (c) => (isInk(c) ? rgba(240, 248, 255, 0.95) : rgba(255, 255, 255, 0.1 + 0.3 * (1 - lum(c)))),
  },
  {
    id: 'vaporwave',
    name: '蒸汽波',
    desc: '落日、紫粉与扫描线',
    background: (p) => {
      p.linear(['#20063b', '#6b1a8a', '#ff5fa2', '#ffb86b'])
      const s = p.size
      p.circle(s * 0.5, s * 0.6, s * 0.3, '#ffd36b')
      for (let i = 0; i < 6; i++) p.rect(0, s * (0.6 + i * 0.05), s, s * 0.012 * (i + 1), '#ff5fa2')
    },
    color: (c) => (isInk(c) ? parse('#1b0b3a') : adjust(c, { hue: 170, satAdd: 0.35 })),
    post: (ctx, size) => scanlines(ctx, size, 0.1),
  },
  {
    id: 'led',
    name: 'LED 点阵',
    desc: '发光二极管显示屏',
    background: (p) => p.fill('#0c0c0c'),
    color: (c) => (isInk(c) ? parse('#3a3a3a') : adjust(c, { satAdd: 0.25, light: clamp(toLight(c), 0.45, 0.75) })),
    shape: 'circle',
    empty: '#1c1c1c',
    glow: 0.35,
  },
  {
    id: 'gold',
    name: '黄金雕像',
    desc: '浇铸成金的收藏品',
    background: (p) => p.linear(['#3a0d22', '#120309']),
    color: (c) => ({ ...ramp(GOLD, lum(c) * 1.1), a: c.a }),
    post: sparkles,
  },
  {
    id: 'glitch',
    name: '故障',
    desc: 'RGB 分离与错位切片',
    background: (p) => p.fill('#111118'),
    post: glitch,
  },
  {
    id: 'voxel',
    name: '体素 3D',
    desc: '挤出成立体积木块',
    background: (p) => p.linear(['#f3eee4', '#d9d1c1']),
    extrude: { depth: 0.38, shade: 0.55 },
    padding: 0.05,
  },
  {
    id: 'terminal',
    name: '终端',
    desc: '绿色字符画',
    background: (p) => p.fill('#031003'),
    color: (c) => rgba(51, 255, 102, 0.35 + 0.65 * (1 - lum(c))),
    shape: 'glyph',
    glow: 0.25,
    post: (ctx, size) => scanlines(ctx, size, 0.25),
  },
  {
    id: 'brick',
    name: '积木',
    desc: '一颗颗带凸点的积木',
    background: (p) => p.fill('#e9e4d8'),
    color: (c) => adjust(c, { satAdd: 0.1 }),
    shape: 'brick',
  },
  {
    id: 'thermal',
    name: '热成像',
    desc: '红外伪彩',
    background: (p) => p.fill('#05031a'),
    color: (c) => ramp(THERMAL, 0.18 + 0.82 * lum(c)),
  },
  {
    id: 'sepia',
    name: '旧照片',
    desc: '褪色、暗角与颗粒',
    background: (p) => p.fill('#d9c7a0'),
    color: (c) =>
      rgba(
        Math.min(255, c.r * 0.393 + c.g * 0.769 + c.b * 0.189),
        Math.min(255, c.r * 0.349 + c.g * 0.686 + c.b * 0.168),
        Math.min(255, c.r * 0.272 + c.g * 0.534 + c.b * 0.131),
        c.a,
      ),
    post: (ctx, size, rng) => {
      vignette(ctx, size, 0.55)
      grain(ctx, size, rng, 0.08)
    },
  },
  {
    id: 'halftone',
    name: '波普网点',
    desc: '漫画印刷的半调网点',
    background: (p) => {
      p.fill('#f6e9c9')
      const u = p.size / 48
      for (let y = 0; y < 48; y++) for (let x = y % 2; x < 48; x += 2) p.circle((x + 0.5) * u, (y + 0.5) * u, u * 0.18, '#e9c46a')
    },
    color: (c) => (isInk(c) ? parse('#1b1b2f') : adjust(c, { satAdd: 0.3 })),
    shape: 'halftone',
  },
  {
    id: 'mono',
    name: '墨水',
    desc: '只有黑白两色的线稿',
    background: (p) => p.fill('#ffffff'),
    color: (c) => (isInk(c) ? rgba(0, 0, 0) : lum(c) < 0.2 ? rgba(30, 30, 30) : rgba(255, 255, 255)),
    shape: 'square',
  },
]

function toLight(c: Rgba) {
  const max = Math.max(c.r, c.g, c.b) / 255
  const min = Math.min(c.r, c.g, c.b) / 255
  return (max + min) / 2
}

export const STYLE_BY_ID: Record<string, Style> = Object.fromEntries(STYLES.map((s) => [s.id, s]))

