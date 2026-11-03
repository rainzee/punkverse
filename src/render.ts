import { css, lerp, lum, parse, type Rgba } from './color'
import { type Grid, SIZE } from './grid'
import { CanvasPainter, type Painter, SvgPainter } from './painter'
import { makeRng } from './rng'
import type { Style } from './styles'

export interface RenderOptions {
  size: number
  background: boolean
  seed: string
}

const GLYPHS = ' .:-=+*#%@'
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

const scale = (c: Rgba, f: number): Rgba => ({ r: c.r * f, g: c.g * f, b: c.b * f, a: c.a })

/** 按风格把像素网格绘制到任意绘图后端 */
export function paint(p: Painter, grid: Grid, style: Style, background: boolean) {
  const S = p.size
  const pad = (style.padding ?? 0) * S
  const ext = style.extrude?.depth ?? 0
  const u = (S - 2 * pad) / (SIZE + ext)
  const shape = style.shape ?? 'square'

  if (background) style.background(p)

  const orig = grid.cells.map((c) => (c ? parse(c) : null))
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= SIZE || y >= SIZE ? null : orig[y * SIZE + x])
  const cells = orig.map((c, i) => (c && style.color ? style.color(c, i % SIZE, Math.floor(i / SIZE), at) : c))

  const box = (x: number, y: number, d = 0) => {
    const x0 = Math.round(pad + x * u + d)
    const y0 = Math.round(pad + y * u + d)
    return { x: x0, y: y0, w: Math.round(pad + (x + 1) * u + d) - x0, h: Math.round(pad + (y + 1) * u + d) - y0 }
  }

  const draw = (x: number, y: number, c: Rgba, o: Rgba) => {
    const b = box(x, y)
    const cx = pad + (x + 0.5) * u
    const cy = pad + (y + 0.5) * u
    const col = css(c)
    switch (shape) {
      case 'square':
        return p.rect(b.x, b.y, b.w, b.h, col)
      case 'gap':
        return p.rect(b.x + u * 0.08, b.y + u * 0.08, u * 0.84, u * 0.84, col)
      case 'circle':
        return p.circle(cx, cy, u * 0.42, col)
      case 'rounded':
        return p.rect(b.x + u * 0.04, b.y + u * 0.04, u * 0.92, u * 0.92, col, u * 0.28)
      case 'brick': {
        p.rect(b.x + u * 0.03, b.y + u * 0.03, u * 0.94, u * 0.94, col, u * 0.1)
        p.circle(cx + u * 0.06, cy + u * 0.08, u * 0.28, css(scale(c, 0.72)))
        return p.circle(cx, cy, u * 0.28, css(lerp(c, { r: 255, g: 255, b: 255, a: c.a }, 0.2)))
      }
      case 'glyph': {
        const ch = GLYPHS[Math.round((1 - lum(o)) * (GLYPHS.length - 1))]
        if (ch !== ' ') p.text(cx, cy, ch, col, u * 1.15)
        return
      }
      case 'dither': {
        const d = u / 4
        const l = lum(o) * o.a + (1 - o.a)
        p.rect(b.x, b.y, b.w, b.h, '#f2efe6')
        for (let sy = 0; sy < 4; sy++)
          for (let sx = 0; sx < 4; sx++)
            if (l < (BAYER[sy][sx] + 0.5) / 16) p.rect(pad + x * u + sx * d, pad + y * u + sy * d, d + 0.01, d + 0.01, '#1a1a1a')
        return
      }
      case 'halftone':
        return p.circle(cx, cy, u * 0.53 * Math.sqrt(0.12 + 0.88 * (1 - lum(o))), col)
    }
  }

  if (style.empty) {
    cells.forEach((c, i) => {
      if (!c) p.circle(pad + ((i % SIZE) + 0.5) * u, pad + (Math.floor(i / SIZE) + 0.5) * u, u * 0.42, style.empty!)
    })
  }

  if (style.extrude) {
    const depth = ext * u
    const steps = Math.max(1, Math.min(16, Math.round(depth)))
    for (let k = steps; k >= 1; k--) {
      cells.forEach((c, i) => {
        if (!c) return
        const b = box(i % SIZE, Math.floor(i / SIZE), (k * depth) / steps)
        p.rect(b.x, b.y, b.w + 1, b.h + 1, css(scale(c, style.extrude!.shade)))
      })
    }
  }

  p.glow((style.glow ?? 0) * u)
  cells.forEach((c, i) => {
    if (c) draw(i % SIZE, Math.floor(i / SIZE), c, orig[i]!)
  })
  p.glow(0)
}

export function renderCanvas(canvas: HTMLCanvasElement, grid: Grid, style: Style, opt: RenderOptions) {
  canvas.width = opt.size
  canvas.height = opt.size
  const ctx = canvas.getContext('2d', { willReadFrequently: style.id === 'glitch' })!
  ctx.clearRect(0, 0, opt.size, opt.size)
  paint(new CanvasPainter(ctx, opt.size), grid, style, opt.background)
  style.post?.(ctx, opt.size, makeRng(`${opt.seed}:${style.id}`))
}

export function renderSvg(grid: Grid, style: Style, opt: RenderOptions): string {
  const crisp = (style.shape ?? 'square') === 'square' && !style.extrude
  const p = new SvgPainter(opt.size, crisp)
  paint(p, grid, style, opt.background)
  return p.toString()
}
