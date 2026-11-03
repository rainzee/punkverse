export interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export function parse(hex: string): Rgba {
  const h = hex.replace('#', '')
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16)
  return { r: n(0), g: n(2), b: n(4), a: h.length >= 8 ? n(6) / 255 : 1 }
}

export function hex(c: Rgba): string {
  const f = (v: number) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')
  return `#${f(c.r)}${f(c.g)}${f(c.b)}${c.a < 1 ? f(c.a * 255) : ''}`
}

export function css(c: Rgba): string {
  if (c.a >= 1) return hex(c)
  return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${c.a.toFixed(3)})`
}

export function lum(c: Rgba): number {
  return (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255
}

export function lerp(a: Rgba, b: Rgba, t: number): Rgba {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
    a: a.a + (b.a - a.a) * t,
  }
}

export const mix = (a: string, b: string, t: number) => hex(lerp(parse(a), parse(b), t))

export function shade(h: string, f: number): string {
  const c = parse(h)
  return hex({ r: c.r * f, g: c.g * f, b: c.b * f, a: c.a })
}

export const alpha = (h: string, a: number) => hex({ ...parse(h), a })

export function over(top: string, bottom: string): string {
  const t = parse(top)
  const b = parse(bottom)
  const a = t.a + b.a * (1 - t.a)
  if (a === 0) return '#00000000'
  const ch = (x: number, y: number) => (x * t.a + y * b.a * (1 - t.a)) / a
  return hex({ r: ch(t.r, b.r), g: ch(t.g, b.g), b: ch(t.b, b.b), a })
}

export function toHsl(c: Rgba): { h: number; s: number; l: number } {
  const r = c.r / 255
  const g = c.g / 255
  const b = c.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h *= 60
  return { h, s, l }
}

export function fromHsl(h: number, s: number, l: number, a = 1): Rgba {
  const hh = (((h % 360) + 360) % 360) / 360
  if (s === 0) return { r: l * 255, g: l * 255, b: l * 255, a }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const f = (t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return { r: f(hh + 1 / 3) * 255, g: f(hh) * 255, b: f(hh - 1 / 3) * 255, a }
}

/** 以 HSL 方式调整颜色, 未给出的分量保持原值 */
export function adjust(c: Rgba, o: { hue?: number; sat?: number; light?: number; satAdd?: number }): Rgba {
  const { h, s, l } = toHsl(c)
  return fromHsl(
    h + (o.hue ?? 0),
    clamp(o.sat ?? s + (o.satAdd ?? 0), 0, 1),
    clamp(o.light ?? l, 0, 1),
    c.a,
  )
}

/** 在多段色带上按 t 取色 */
export function ramp(stops: string[], t: number): Rgba {
  const x = clamp(t, 0, 1) * (stops.length - 1)
  const i = Math.min(Math.floor(x), stops.length - 2)
  return lerp(parse(stops[i]), parse(stops[i + 1]), x - i)
}
