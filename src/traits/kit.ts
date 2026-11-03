import { alpha, mix, shade } from '../color'
import { type Grid, type Hex, withOutline } from '../grid'
import type { Rng } from '../rng'

export type Slot = 'head' | 'eyes' | 'beard' | 'mouth' | 'outfit' | 'acc'
export type Sex = 'm' | 'f'

/** 部件配色 */
export interface Swatch {
  name: string
  main: Hex
  dark: Hex
  light: Hex
}

/** 皮肤调色板, 对应头部字符画中的 s d w p m */
export interface SkinPalette {
  s: Hex
  d: Hex
  w: Hex
  p: Hex
  m: Hex
}

/** 头部关键位置, 部件依据锚点绘制从而同时适配男女头型 */
export interface Anchors {
  top: number
  L: number
  R: number
  eyeY: number
  eyeL: number
  eyeR: number
  noseX: number
  mouthY: number
  mouthL: number
  mouthR: number
  earX: number
  chinY: number
  neckL: number
  neckR: number
  face: (x: number, y: number) => boolean
}

export interface DrawCtx {
  g: Grid
  a: Anchors
  rng: Rng
  c: Swatch
  skin: SkinPalette
  sex: Sex
}

/** 头像部件 */
export interface Trait {
  id: string
  name: string
  slot: Slot
  z: number
  weight: number
  sex?: Sex
  swatches: Swatch[]
  draw: (ctx: DrawCtx) => void
}

export function swatch(name: string, main: Hex): Swatch {
  return { name, main, dark: shade(main, 0.7), light: mix(main, '#ffffff', 0.4) }
}

export const K = '#000000'
export const W = '#ffffff'

export const HAIR = [
  swatch('黑', '#1d1d1d'),
  swatch('棕', '#5a3a12'),
  swatch('金', '#f3dc6b'),
  swatch('红', '#d9541e'),
  swatch('紫', '#7b2fd1'),
  swatch('粉', '#ea4c9a'),
  swatch('绿', '#2fb04a'),
  swatch('灰', '#9a9a9a'),
  swatch('白', '#eeeeee'),
  swatch('蓝', '#2a5bd7'),
]
export const BEARD = HAIR.slice(0, 4).concat(HAIR[7], HAIR[8])
export const HAT = [
  swatch('红', '#c4271b'),
  swatch('蓝', '#2346b0'),
  swatch('黑', '#2a2a2a'),
  swatch('紫', '#6a2bb3'),
  swatch('绿', '#2e7d32'),
  swatch('灰', '#7d7d7d'),
  swatch('白', '#ececec'),
  swatch('棕', '#7b4a1e'),
  swatch('橙', '#e8771a'),
]
export const LENS = [swatch('黑', '#121212'), swatch('紫', '#5b1fa8'), swatch('绿', '#1f6b3a'), swatch('红', '#a01a1a'), swatch('金', '#b8860b')]
export const METAL = [swatch('金', '#ffd23a'), swatch('银', '#d9d9d9')]
export const SHADOW = [swatch('蓝', '#3b6fd8'), swatch('紫', '#8d3ad6'), swatch('绿', '#38a85a')]
export const LIPS = [swatch('热粉', '#e8308a'), swatch('紫', '#7a2a9c'), swatch('黑', '#1a1a1a'), swatch('正红', '#c81e1e')]
export const CLOTH = [
  ...HAT,
  swatch('藏青', '#1b2a5c'),
  swatch('酒红', '#7a1730'),
  swatch('军绿', '#556b2f'),
  swatch('天蓝', '#5aa9e6'),
  swatch('芥黄', '#d4a017'),
]
export const PAINT = [swatch('红', '#d62828'), swatch('蓝', '#1d4ed8'), swatch('白', '#f4f4f4'), swatch('金', '#ffd23a')]
export const PLAIN = [swatch('', '#000000')]
export const one = (name: string, main: Hex) => [swatch(name, main)]

const Z: Record<Slot, number> = { outfit: 1.5, beard: 2, mouth: 3, eyes: 4, head: 5, acc: 6 }

export function t(o: Omit<Trait, 'z' | 'swatches'> & { z?: number; swatches?: Swatch[] }): Trait {
  return { ...o, z: o.z ?? Z[o.slot], swatches: o.swatches ?? PLAIN }
}

/** 随机毛躁的发团, 覆盖头顶与两侧 */
export function cloud(
  { g, a, rng, c }: DrawCtx,
  o: { up: number; side: number; down: number; cover: number; jag: number; curly?: boolean },
) {
  const x0 = a.L - o.side
  const x1 = a.R + o.side
  const y0 = a.top - o.up
  for (let y = y0; y <= o.down; y++) {
    for (let x = x0; x <= x1; x++) {
      const top = y <= a.top + o.cover
      const side = x < a.L || x > a.R
      if (!top && !side) continue
      if (y === y0 && (x <= x0 + 1 || x >= x1 - 1)) continue
      const edge = y === y0 || x === x0 || x === x1 || y === o.down
      if (edge && rng() < o.jag) continue
      const dark = o.curly ? (x + y) % 2 === 0 && rng() < 0.7 : rng() < 0.18
      g.set(x, y, dark ? c.dark : c.main)
    }
  }
}

export function straightHair({ g, a, c }: DrawCtx) {
  g.rect(a.L - 1, a.top - 1, a.R - a.L + 3, 2, c.main)
  g.rect(a.L - 2, a.top, 3, a.chinY - a.top + 2, c.main)
  g.vline(a.L - 1, a.top + 1, a.chinY + 1, c.dark)
  g.rect(a.R, a.top, 2, a.mouthY - a.top + 1, c.main)
  g.hline(a.top + 1, a.L, a.L + 3, c.main)
  g.set(a.L + 2, a.top - 1, c.light)
}
