/** 绘图后端抽象, 同一套渲染逻辑可同时输出 Canvas 与 SVG */
export interface Painter {
  readonly size: number
  fill(color: string): void
  linear(stops: string[]): void
  rect(x: number, y: number, w: number, h: number, color: string, radius?: number): void
  circle(cx: number, cy: number, r: number, color: string): void
  text(cx: number, cy: number, s: string, color: string, px: number): void
  line(x1: number, y1: number, x2: number, y2: number, color: string, width: number): void
  glow(blur: number): void
}

export class CanvasPainter implements Painter {
  private blur = 0

  constructor(
    readonly ctx: CanvasRenderingContext2D,
    readonly size: number,
  ) {}

  private paint(color: string) {
    this.ctx.fillStyle = color
    this.ctx.shadowBlur = this.blur
    this.ctx.shadowColor = this.blur ? color : 'transparent'
  }

  fill(color: string) {
    this.paint(color)
    this.ctx.fillRect(0, 0, this.size, this.size)
  }

  linear(stops: string[]) {
    const g = this.ctx.createLinearGradient(0, 0, 0, this.size)
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c))
    this.ctx.fillStyle = g
    this.ctx.shadowBlur = 0
    this.ctx.fillRect(0, 0, this.size, this.size)
  }

  rect(x: number, y: number, w: number, h: number, color: string, radius = 0) {
    this.paint(color)
    if (radius <= 0) return this.ctx.fillRect(x, y, w, h)
    this.ctx.beginPath()
    this.ctx.roundRect(x, y, w, h, radius)
    this.ctx.fill()
  }

  circle(cx: number, cy: number, r: number, color: string) {
    this.paint(color)
    this.ctx.beginPath()
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2)
    this.ctx.fill()
  }

  text(cx: number, cy: number, s: string, color: string, px: number) {
    this.paint(color)
    this.ctx.font = `700 ${px}px ui-monospace, "Cascadia Mono", Consolas, monospace`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(s, cx, cy)
  }

  line(x1: number, y1: number, x2: number, y2: number, color: string, width: number) {
    this.ctx.shadowBlur = 0
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = width
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
  }

  glow(blur: number) {
    this.blur = blur
  }
}

const n = (v: number) => +v.toFixed(2)
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export class SvgPainter implements Painter {
  private parts: string[] = []
  private defs: string[] = []
  private blur = 0
  private ids = 0

  constructor(
    readonly size: number,
    private crisp = true,
  ) {}

  private attrs() {
    return this.blur ? ` filter="url(#glow${this.ids})"` : ''
  }

  fill(color: string) {
    this.parts.push(`<rect width="${this.size}" height="${this.size}" fill="${color}"/>`)
  }

  linear(stops: string[]) {
    const id = `bg${this.ids++}`
    const st = stops.map((c, i) => `<stop offset="${n(i / (stops.length - 1))}" stop-color="${c}"/>`).join('')
    this.defs.push(`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${st}</linearGradient>`)
    this.parts.push(`<rect width="${this.size}" height="${this.size}" fill="url(#${id})"/>`)
  }

  rect(x: number, y: number, w: number, h: number, color: string, radius = 0) {
    const r = radius > 0 ? ` rx="${n(radius)}"` : ''
    this.parts.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"${r} fill="${color}"${this.attrs()}/>`)
  }

  circle(cx: number, cy: number, r: number, color: string) {
    this.parts.push(`<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${color}"${this.attrs()}/>`)
  }

  text(cx: number, cy: number, s: string, color: string, px: number) {
    this.parts.push(
      `<text x="${n(cx)}" y="${n(cy)}" font-size="${n(px)}" font-weight="700" font-family="ui-monospace,Consolas,monospace" text-anchor="middle" dominant-baseline="central" fill="${color}"${this.attrs()}>${esc(s)}</text>`,
    )
  }

  line(x1: number, y1: number, x2: number, y2: number, color: string, width: number) {
    this.parts.push(`<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="${n(width)}"/>`)
  }

  glow(blur: number) {
    this.blur = blur
    if (!blur) return
    this.ids++
    this.defs.push(
      `<filter id="glow${this.ids}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${n(blur / 2)}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    )
  }

  toString() {
    const s = this.size
    const crisp = this.crisp ? ' shape-rendering="crispEdges"' : ''
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}"${crisp}><defs>${this.defs.join('')}</defs>${this.parts.join('')}</svg>`
  }
}
