import { alpha, mix, shade } from './color'
import { type Grid, type Hex, withOutline } from './grid'
import type { Rng } from './rng'

export type Slot = 'head' | 'eyes' | 'beard' | 'mouth' | 'acc'
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

const K = '#000000'
const W = '#ffffff'

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
const BEARD = HAIR.slice(0, 4).concat(HAIR[7], HAIR[8])
const HAT = [
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
const LENS = [swatch('黑', '#121212'), swatch('紫', '#5b1fa8'), swatch('绿', '#1f6b3a'), swatch('红', '#a01a1a'), swatch('金', '#b8860b')]
const METAL = [swatch('金', '#ffd23a'), swatch('银', '#d9d9d9')]
const SHADOW = [swatch('蓝', '#3b6fd8'), swatch('紫', '#8d3ad6'), swatch('绿', '#38a85a')]
const LIPS = [swatch('热粉', '#e8308a'), swatch('紫', '#7a2a9c'), swatch('黑', '#1a1a1a'), swatch('正红', '#c81e1e')]
const PLAIN = [swatch('', '#000000')]
const one = (name: string, main: Hex) => [swatch(name, main)]

const Z: Record<Slot, number> = { acc: 6, beard: 2, mouth: 3, eyes: 4, head: 5 }

function t(o: Omit<Trait, 'z' | 'swatches'> & { z?: number; swatches?: Swatch[] }): Trait {
  return { ...o, z: o.z ?? Z[o.slot], swatches: o.swatches ?? PLAIN }
}

/** 随机毛躁的发团, 覆盖头顶与两侧 */
function cloud(
  { g, a, rng, c }: DrawCtx,
  o: { up: number; side: number; down: number; cover: number; jag: number },
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
      g.set(x, y, rng() < 0.18 ? c.dark : c.main)
    }
  }
}

function straightHair({ g, a, c }: DrawCtx) {
  g.rect(a.L - 1, a.top - 1, a.R - a.L + 3, 2, c.main)
  g.rect(a.L - 2, a.top, 3, a.chinY - a.top + 2, c.main)
  g.vline(a.L - 1, a.top + 1, a.chinY + 1, c.dark)
  g.rect(a.R, a.top, 2, a.mouthY - a.top + 1, c.main)
  g.hline(a.top + 1, a.L, a.L + 3, c.main)
  g.set(a.L + 2, a.top - 1, c.light)
}

const head: Trait[] = [
  t({
    id: 'mohawk',
    name: '莫西干',
    slot: 'head',
    weight: 7,
    swatches: HAIR,
    draw: ({ g, a, c }) => {
      for (let y = a.top - 5; y <= a.top + 1; y++) {
        g.set(11, y, c.main)
        g.set(12, y, c.dark)
      }
      for (let y = a.top - 4; y <= a.top; y += 2) {
        g.set(10, y, c.main)
        g.set(13, y + 1, c.dark)
      }
    },
  }),
  t({
    id: 'wild',
    name: '狂野乱发',
    slot: 'head',
    weight: 6,
    swatches: HAIR,
    draw: (ctx) => cloud(ctx, { up: 4, side: 2, down: ctx.a.eyeY + 3, cover: 1, jag: 0.5 }),
  }),
  t({
    id: 'messy',
    name: '凌乱短发',
    slot: 'head',
    weight: 8,
    swatches: HAIR,
    draw: (ctx) => cloud(ctx, { up: 2, side: 1, down: ctx.a.top + 3, cover: 1, jag: 0.6 }),
  }),
  t({
    id: 'crazy',
    name: '爆炸头',
    slot: 'head',
    weight: 4,
    swatches: HAIR,
    draw: (ctx) => cloud(ctx, { up: 5, side: 3, down: ctx.a.mouthY + 2, cover: 1, jag: 0.55 }),
  }),
  t({
    id: 'frumpy',
    name: '蓬松发',
    slot: 'head',
    weight: 5,
    swatches: HAIR,
    draw: (ctx) => cloud(ctx, { up: 3, side: 1, down: ctx.a.eyeY + 1, cover: 2, jag: 0.25 }),
  }),
  t({
    id: 'stringy',
    name: '细丝发',
    slot: 'head',
    weight: 4,
    swatches: HAIR,
    draw: ({ g, a, c, rng }) => {
      for (let x = a.L - 1; x <= a.R + 1; x++) {
        const edge = x <= a.L + 1 || x >= a.R
        const len = edge ? 4 + Math.floor(rng() * 6) : 1 + Math.floor(rng() * 3)
        for (let y = a.top - 1; y < a.top - 1 + len; y++) g.set(x, y, x % 2 ? c.main : c.dark)
      }
    },
  }),
  t({
    id: 'spike',
    name: '刺猬头',
    slot: 'head',
    weight: 5,
    swatches: HAIR,
    draw: ({ g, a, c, rng }) => {
      g.rect(a.L, a.top - 1, a.R - a.L + 1, 2, c.main)
      for (let x = a.L; x <= a.R; x += 2) {
        const h = 2 + Math.floor(rng() * 3)
        g.vline(x, a.top - 1 - h, a.top - 2, c.main)
        g.set(x + 1, a.top - 2, c.dark)
      }
    },
  }),
  t({
    id: 'vampire',
    name: '吸血鬼背头',
    slot: 'head',
    weight: 3,
    swatches: one('黑', '#141414'),
    draw: ({ g, a, c }) => {
      g.rect(a.L - 1, a.top - 1, a.R - a.L + 3, 2, c.main)
      g.hline(a.top + 1, a.L, a.R, c.main)
      g.hline(a.top + 2, 11, 12, c.main)
      g.vline(a.L - 1, a.top, a.eyeY + 1, c.main)
      g.vline(a.L, a.top, a.eyeY - 1, c.main)
      g.hline(a.top, a.L + 2, a.L + 4, '#3a3a3a')
    },
  }),
  t({
    id: 'clown-hair',
    name: '小丑卷发',
    slot: 'head',
    weight: 2,
    swatches: one('绿', '#2fb04a'),
    draw: ({ g, a, c, rng }) => {
      for (const cx of [a.L - 2, a.R + 2]) {
        const cy = a.top + 3
        for (let y = cy - 4; y <= cy + 4; y++) {
          for (let x = cx - 3; x <= cx + 3; x++) {
            const d = Math.abs(x - cx) + Math.abs(y - cy) * 0.8
            if (d > 3.4 || (d > 2.6 && rng() < 0.4)) continue
            g.set(x, y, rng() < 0.25 ? c.dark : c.main)
          }
        }
      }
    },
  }),
  t({
    id: 'shaved',
    name: '寸头',
    slot: 'head',
    weight: 4,
    swatches: [HAIR[0], HAIR[1]],
    draw: ({ g, a, c, rng }) => {
      for (let y = a.top - 1; y <= a.top + 2; y++)
        for (let x = a.L; x <= a.R; x++) if ((x + y) % 2 === 0 && rng() < 0.75) g.set(x, y, alpha(c.main, 0.55))
    },
  }),
  t({
    id: 'cap',
    name: '棒球帽',
    slot: 'head',
    weight: 7,
    swatches: HAT,
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.hline(a.top - 3, a.L + 2, a.R - 2, c.main)
        l.rect(a.L, a.top - 2, a.R - a.L + 1, 3, c.main)
        l.hline(a.top + 1, a.L, a.R + 3, c.dark)
        l.set(a.L + 3, a.top - 2, c.light)
        l.set(11, a.top - 3, c.dark)
      }),
  }),
  t({
    id: 'beanie',
    name: '毛线帽',
    slot: 'head',
    weight: 5,
    swatches: HAT,
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.rect(11, a.top - 6, 2, 2, c.light)
        l.hline(a.top - 4, a.L + 2, a.R - 2, c.main)
        l.hline(a.top - 3, a.L + 1, a.R - 1, c.main)
        l.rect(a.L, a.top - 2, a.R - a.L + 1, 2, c.main)
        l.rect(a.L, a.top, a.R - a.L + 1, 2, c.dark)
        for (let x = a.L; x <= a.R; x += 2) l.set(x, a.top, c.main)
      }),
  }),
  t({
    id: 'knitted',
    name: '条纹尖帽',
    slot: 'head',
    weight: 4,
    swatches: HAT,
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        for (let i = 0; i <= 6; i++) {
          const y = a.top - 5 + i
          l.hline(y, Math.max(a.L, 11 - i), Math.min(a.R, 12 + i), i % 2 ? c.main : W)
        }
        l.hline(a.top + 1, a.L, a.R, c.dark)
      }),
  }),
  t({
    id: 'tophat',
    name: '高礼帽',
    slot: 'head',
    weight: 3,
    swatches: HAT,
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.rect(a.L + 1, a.top - 8, a.R - a.L - 1, 7, '#1c1c1c')
        l.vline(a.L + 2, a.top - 8, a.top - 3, '#3a3a3a')
        l.hline(a.top - 2, a.L + 1, a.R - 1, c.main)
        l.hline(a.top - 1, a.L - 2, a.R + 2, '#1c1c1c')
      }),
  }),
  t({
    id: 'cowboy',
    name: '牛仔帽',
    slot: 'head',
    weight: 3,
    swatches: [HAT[7], HAT[2], HAT[6]],
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.rect(a.L + 1, a.top - 4, 11 - a.L - 1, 1, c.main)
        l.rect(13, a.top - 4, a.R - 13, 1, c.main)
        l.rect(a.L + 1, a.top - 3, a.R - a.L - 1, 3, c.main)
        l.hline(a.top - 1, a.L + 1, a.R - 1, c.dark)
        l.hline(a.top, a.L - 3, a.R + 3, c.main)
        l.set(a.L - 3, a.top - 1, c.main)
        l.set(a.R + 3, a.top - 1, c.main)
      }),
  }),
  t({
    id: 'fedora',
    name: '绅士礼帽',
    slot: 'head',
    weight: 3,
    swatches: HAT,
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.hline(a.top - 3, a.L + 1, a.R - 1, c.main)
        l.set(11, a.top - 3, c.dark)
        l.set(12, a.top - 3, c.dark)
        l.hline(a.top - 2, a.L, a.R, c.main)
        l.hline(a.top - 1, a.L, a.R, '#1a1a1a')
        l.hline(a.top, a.L - 2, a.R + 2, c.dark)
      }),
  }),
  t({
    id: 'police',
    name: '警帽',
    slot: 'head',
    weight: 2,
    swatches: one('藏青', '#1b2a5c'),
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.hline(a.top - 4, a.L - 1, a.R + 1, c.main)
        l.rect(a.L, a.top - 3, a.R - a.L + 1, 2, c.main)
        l.hline(a.top - 1, a.L, a.R, '#111111')
        l.hline(a.top - 3, 11, 12, '#ffd23a')
        l.hline(a.top, a.L + 3, a.R + 2, '#111111')
      }),
  }),
  t({
    id: 'bandana',
    name: '头巾',
    slot: 'head',
    weight: 4,
    swatches: HAT,
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.hline(a.top - 1, a.L + 1, a.R - 1, c.main)
        l.rect(a.L, a.top, a.R - a.L + 1, 2, c.main)
        for (let x = a.L; x <= a.R; x++) if ((x + a.top) % 3 === 0) l.set(x, a.top, c.light)
        l.set(a.L - 1, a.top + 1, c.main)
        l.set(a.L - 2, a.top + 2, c.main)
        l.set(a.L - 1, a.top + 2, c.dark)
        l.set(a.L - 2, a.top + 3, c.dark)
      }),
  }),
  t({
    id: 'dorag',
    name: '杜拉格',
    slot: 'head',
    weight: 3,
    swatches: HAT,
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.hline(a.top - 2, a.L + 1, a.R - 1, c.main)
        l.rect(a.L, a.top - 1, a.R - a.L + 1, 3, c.main)
        l.hline(a.top + 1, a.L, a.R, c.dark)
        l.vline(a.L - 1, a.top + 1, a.top + 5, c.dark)
      }),
  }),
  t({
    id: 'headband',
    name: '发带',
    slot: 'head',
    weight: 4,
    swatches: [...HAT, swatch('白', '#ffffff')],
    draw: ({ g, a, c }) => {
      g.hline(a.top + 2, a.L - 1, a.R, c.main)
      g.set(a.L - 2, a.top + 3, c.main)
      g.set(a.L - 1, a.top + 3, c.dark)
    },
  }),
  t({
    id: 'hoodie',
    name: '连帽衫',
    slot: 'head',
    weight: 3,
    swatches: HAT,
    draw: ({ g, a, c }) => {
      const hood = (x: number, y: number) => {
        if (a.face(x, y) || x < a.L - 3 || x > a.R + 3 || y < a.top - 3) return false
        if (y === a.top - 3) return x >= a.L && x <= a.R
        if (y === a.top - 2) return x >= a.L - 2 && x <= a.R + 2
        return true
      }
      const nearFace = (x: number, y: number) =>
        a.face(x - 1, y) || a.face(x + 1, y) || a.face(x, y - 1) || a.face(x, y + 1)
      withOutline(
        g,
        K,
        (l) => {
          for (let y = 0; y < 24; y++)
            for (let x = 0; x < 24; x++) {
              if (!hood(x, y)) continue
              l.set(x, y, nearFace(x, y) ? c.dark : (x * 3 + y) % 7 === 0 ? c.light : c.main)
            }
        },
        a.face,
      )
    },
  }),
  t({
    id: 'crown',
    name: '王冠',
    slot: 'head',
    weight: 1,
    swatches: one('金', '#ffd23a'),
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.rect(a.L + 1, a.top - 2, a.R - a.L - 1, 2, c.main)
        for (const x of [a.L + 1, 11, 12, a.R - 1]) l.vline(x, a.top - 4, a.top - 3, c.main)
        l.set(a.L + 3, a.top - 1, '#e0245e')
        l.set(11, a.top - 1, '#2a8cff')
        l.set(a.R - 3, a.top - 1, '#2bd46a')
        l.hline(a.top - 2, a.L + 1, a.R - 1, c.light)
      }),
  }),
  t({
    id: 'halo',
    name: '光环',
    slot: 'head',
    weight: 1,
    swatches: one('金', '#ffe766'),
    draw: ({ g, a, c }) => {
      g.hline(a.top - 4, a.L + 2, a.R - 2, c.main)
      g.hline(a.top - 2, a.L + 2, a.R - 2, c.main)
      g.set(a.L + 1, a.top - 3, c.main)
      g.set(a.R - 1, a.top - 3, c.main)
      g.hline(a.top - 3, a.L + 2, a.R - 2, alpha('#fff8c8', 0.35))
    },
  }),
  t({ id: 'straight', name: '直长发', slot: 'head', sex: 'f', weight: 7, swatches: HAIR, draw: straightHair }),
  t({
    id: 'bob',
    name: '波波头',
    slot: 'head',
    sex: 'f',
    weight: 6,
    swatches: HAIR,
    draw: ({ g, a, c }) => {
      g.rect(a.L - 1, a.top - 2, a.R - a.L + 3, 3, c.main)
      g.hline(a.top - 2, a.L - 1, a.L - 1, null)
      g.hline(a.top - 2, a.R + 1, a.R + 1, null)
      g.rect(a.L - 2, a.top, 3, a.mouthY - a.top + 2, c.main)
      g.rect(a.R, a.top, 2, a.mouthY - a.top + 2, c.main)
      g.hline(a.mouthY + 1, a.L - 2, a.L, c.dark)
      g.hline(a.mouthY + 1, a.R, a.R + 1, c.dark)
      g.set(a.L + 3, a.top - 1, c.light)
    },
  }),
  t({
    id: 'pigtails',
    name: '双马尾',
    slot: 'head',
    sex: 'f',
    weight: 4,
    swatches: HAIR,
    draw: ({ g, a, c }) => {
      g.rect(a.L - 1, a.top - 1, a.R - a.L + 3, 2, c.main)
      g.vline(a.L - 1, a.top + 1, a.eyeY, c.main)
      g.rect(a.L - 4, a.top + 1, 3, 4, c.main)
      g.rect(a.R + 2, a.top + 1, 3, 4, c.main)
      g.set(a.L - 1, a.top + 2, c.light)
      g.set(a.R + 1, a.top + 2, c.light)
      g.vline(a.L - 3, a.top + 2, a.top + 4, c.dark)
      g.vline(a.R + 3, a.top + 2, a.top + 4, c.dark)
    },
  }),
  t({
    id: 'half-shaved',
    name: '半边剃',
    slot: 'head',
    sex: 'f',
    weight: 3,
    swatches: HAIR,
    draw: ({ g, a, c }) => {
      g.rect(a.L - 1, a.top - 2, 6, 3, c.main)
      g.rect(a.L - 2, a.top, 3, a.chinY - a.top + 1, c.main)
      g.vline(a.L - 1, a.top + 2, a.chinY, c.dark)
      for (let x = a.L + 5; x <= a.R; x += 2) g.set(x, a.top, alpha(c.main, 0.5))
    },
  }),
  t({
    id: 'tiara',
    name: '公主头冠',
    slot: 'head',
    sex: 'f',
    weight: 2,
    swatches: HAIR.slice(0, 4),
    draw: (ctx) => {
      const { g, a } = ctx
      straightHair(ctx)
      g.hline(a.top - 2, a.L + 1, a.R - 1, '#ffd23a')
      g.set(a.L + 2, a.top - 3, '#ffd23a')
      g.set(a.R - 2, a.top - 3, '#ffd23a')
      g.vline(11, a.top - 4, a.top - 3, '#ffd23a')
      g.set(11, a.top - 2, '#e0245e')
    },
  }),
]

const eyes: Trait[] = [
  t({
    id: 'shades',
    name: '经典墨镜',
    slot: 'eyes',
    weight: 8,
    swatches: LENS,
    draw: ({ g, a, c }) => {
      const Y = a.eyeY
      g.hline(Y - 1, a.L - 1, a.eyeR + 2, K)
      g.rect(a.eyeL - 1, Y, 3, 2, c.main)
      g.rect(a.eyeR - 1, Y, 3, 2, c.main)
      g.set(a.eyeL - 1, Y, c.light)
      g.set(a.eyeR - 1, Y, c.light)
      g.hline(Y, a.eyeL + 2, a.eyeR - 2, K)
    },
  }),
  t({
    id: 'big-shades',
    name: '大框墨镜',
    slot: 'eyes',
    weight: 5,
    swatches: LENS,
    draw: ({ g, a, c }) => {
      const Y = a.eyeY
      withOutline(g, K, (l) => {
        l.rect(a.eyeL - 2, Y - 1, 4, 3, c.main)
        l.rect(a.eyeR - 1, Y - 1, 4, 3, c.main)
        l.set(a.eyeL - 1, Y, c.light)
        l.set(a.eyeR, Y, c.light)
      })
      g.hline(Y - 1, a.L - 1, a.eyeL - 3, K)
    },
  }),
  t({
    id: 'small-shades',
    name: '小墨镜',
    slot: 'eyes',
    weight: 5,
    swatches: LENS,
    draw: ({ g, a, c }) => {
      const Y = a.eyeY
      g.hline(Y, a.L - 1, a.eyeR + 1, K)
      g.hline(Y, a.eyeL, a.eyeL + 1, c.main)
      g.hline(Y, a.eyeR, a.eyeR + 1, c.main)
      g.set(a.eyeL, Y, c.light)
      g.set(a.eyeR, Y, c.light)
    },
  }),
  t({
    id: '3d',
    name: '3D 眼镜',
    slot: 'eyes',
    weight: 3,
    draw: ({ g, a }) => {
      const Y = a.eyeY
      withOutline(g, K, (l) => {
        l.rect(a.eyeL - 2, Y - 1, a.eyeR - a.eyeL + 5, 3, W)
        l.rect(a.eyeL - 1, Y, 3, 2, '#e02a2a')
        l.rect(a.eyeR - 1, Y, 3, 2, '#2a6fe0')
        l.hline(Y + 1, a.eyeL - 2, a.eyeR + 2, W)
        l.hline(Y + 1, a.eyeL - 1, a.eyeL + 1, '#e02a2a')
        l.hline(Y + 1, a.eyeR - 1, a.eyeR + 1, '#2a6fe0')
      })
      g.hline(Y - 1, a.L - 1, a.eyeL - 3, W)
    },
  }),
  t({
    id: 'vr',
    name: 'VR 头显',
    slot: 'eyes',
    weight: 2,
    swatches: [swatch('灰', '#b4b4b4'), swatch('白', '#eeeeee'), swatch('黑', '#3a3a3a')],
    draw: ({ g, a, c }) => {
      const Y = a.eyeY
      g.hline(Y, a.L - 1, a.eyeL - 3, K)
      withOutline(g, K, (l) => {
        l.rect(a.eyeL - 2, Y - 1, a.R + 3 - a.eyeL, 3, c.main)
        l.hline(Y - 1, a.eyeL - 2, a.R + 1, c.light)
        l.hline(Y + 1, a.eyeL - 2, a.R + 1, c.dark)
      })
    },
  }),
  t({
    id: 'nerd',
    name: '书呆子眼镜',
    slot: 'eyes',
    weight: 6,
    draw: ({ g, a }) => {
      const Y = a.eyeY
      const box = (x0: number) => {
        g.hline(Y - 1, x0, x0 + 3, K)
        g.hline(Y + 1, x0, x0 + 3, K)
        g.set(x0, Y, K)
        g.set(x0 + 3, Y, K)
      }
      box(a.eyeL - 1)
      box(a.eyeR - 1)
      g.hline(Y - 1, a.L - 1, a.eyeR - 1, K)
    },
  }),
  t({
    id: 'horn-rim',
    name: '玳瑁框眼镜',
    slot: 'eyes',
    weight: 5,
    swatches: [swatch('玳瑁', '#6b3d1c'), swatch('黑', '#1a1a1a'), swatch('红', '#a3201c')],
    draw: ({ g, a, c }) => {
      const Y = a.eyeY
      for (const x0 of [a.eyeL - 1, a.eyeR - 1]) {
        g.hline(Y - 1, x0, x0 + 3, c.main)
        g.hline(Y + 1, x0, x0 + 3, K)
        g.set(x0, Y, K)
        g.set(x0 + 3, Y, K)
        g.hline(Y, x0 + 1, x0 + 2, alpha('#bfe6ff', 0.35))
      }
      g.hline(Y - 1, a.L - 1, a.eyeR - 1, c.main)
    },
  }),
  t({
    id: 'patch',
    name: '海盗眼罩',
    slot: 'eyes',
    weight: 3,
    draw: ({ g, a }) => {
      const Y = a.eyeY
      g.rect(a.eyeR - 1, Y - 1, 3, 3, K)
      for (let x = a.eyeR - 2; x >= a.L - 1; x--) g.set(x, Y - 1 - Math.floor((a.eyeR - 2 - x) / 2), K)
    },
  }),
  t({
    id: 'mask',
    name: '侠盗面罩',
    slot: 'eyes',
    weight: 3,
    swatches: [swatch('黑', '#111111'), swatch('红', '#b31b1b'), swatch('蓝', '#1d3d9e')],
    draw: ({ g, a, c }) => {
      const Y = a.eyeY
      g.rect(a.L - 1, Y - 1, a.R - a.L + 2, 3, c.main)
      g.set(a.L - 2, Y + 1, c.main)
      g.set(a.L - 2, Y + 2, c.dark)
      g.set(a.eyeL, Y, W)
      g.set(a.eyeR, Y, W)
      g.set(a.eyeL + 1, Y, K)
      g.set(a.eyeR + 1, Y, K)
    },
  }),
  t({
    id: 'welding',
    name: '焊接护目镜',
    slot: 'eyes',
    weight: 2,
    draw: ({ g, a }) => {
      const Y = a.eyeY
      g.hline(Y - 1, a.L - 1, a.R, '#3b2a14')
      withOutline(g, '#5a4416', (l) => {
        l.rect(a.eyeL - 1, Y - 1, 3, 3, '#2b4a3a')
        l.rect(a.eyeR - 1, Y - 1, 3, 3, '#2b4a3a')
        l.set(a.eyeL - 1, Y - 1, '#7fc2a0')
        l.set(a.eyeR - 1, Y - 1, '#7fc2a0')
      })
    },
  }),
  t({
    id: 'clown-eyes',
    name: '小丑眼妆',
    slot: 'eyes',
    weight: 2,
    swatches: [swatch('蓝', '#2a6fe0'), swatch('绿', '#2fb04a')],
    draw: ({ g, a, c }) => {
      for (const e of [a.eyeL, a.eyeR]) {
        g.hline(a.eyeY - 1, e, e + 1, c.main)
        g.hline(a.eyeY + 1, e, e + 1, c.main)
        g.set(e, a.eyeY - 2, c.light)
      }
    },
  }),
  t({
    id: 'laser',
    name: '激光眼',
    slot: 'eyes',
    weight: 2,
    swatches: [swatch('红', '#ff2020'), swatch('绿', '#2bff5a'), swatch('蓝', '#2bd4ff')],
    draw: ({ g, a, c }) => {
      const Y = a.eyeY
      for (const e of [a.eyeL, a.eyeR]) {
        g.set(e, Y, W)
        g.set(e + 1, Y, c.main)
      }
      g.hline(Y, a.eyeR + 2, 23, c.main)
      g.hline(Y - 1, a.eyeR + 2, 23, alpha(c.light, 0.55))
      g.hline(Y + 1, a.eyeR + 2, 23, alpha(c.light, 0.55))
    },
  }),
  t({
    id: 'eye-shadow',
    name: '眼影',
    slot: 'eyes',
    sex: 'f',
    weight: 6,
    swatches: SHADOW,
    draw: ({ g, a, c }) => {
      for (const e of [a.eyeL, a.eyeR]) {
        g.hline(a.eyeY - 1, e, e + 1, c.main)
        g.set(e, a.eyeY, c.light)
      }
    },
  }),
]

function beardCells(a: Anchors, from: number, sideburn: boolean): [number, number][] {
  const out: [number, number][] = []
  for (let y = a.eyeY + 1; y <= a.chinY; y++) {
    for (let x = 0; x < 24; x++) {
      if (!a.face(x, y)) continue
      if (y === a.mouthY && x >= a.mouthL && x <= a.mouthR) continue
      if (y >= from || (sideburn && x <= a.L + 1)) out.push([x, y])
    }
  }
  return out
}

const beard: Trait[] = [
  t({
    id: 'mustache',
    name: '八字胡',
    slot: 'beard',
    sex: 'm',
    weight: 7,
    swatches: BEARD,
    draw: ({ g, a, c }) => g.hline(a.mouthY - 1, a.mouthL - 1, a.mouthR + 1, c.main),
  }),
  t({
    id: 'handlebars',
    name: '翘胡子',
    slot: 'beard',
    sex: 'm',
    weight: 4,
    swatches: BEARD,
    draw: ({ g, a, c }) => {
      g.hline(a.mouthY - 1, a.mouthL - 1, a.mouthR + 1, c.main)
      g.vline(a.mouthL - 2, a.mouthY, a.mouthY + 1, c.main)
      g.vline(a.mouthR + 2, a.mouthY, a.mouthY + 1, c.main)
    },
  }),
  t({
    id: 'goat',
    name: '山羊胡',
    slot: 'beard',
    sex: 'm',
    weight: 5,
    swatches: BEARD,
    draw: ({ g, a, c }) => g.rect(a.mouthL, a.mouthY + 2, 3, 2, c.main),
  }),
  t({
    id: 'chinstrap',
    name: '络腮线',
    slot: 'beard',
    sex: 'm',
    weight: 5,
    swatches: BEARD,
    draw: ({ g, a, c }) => {
      for (let y = a.eyeY + 2; y <= a.chinY; y++)
        for (let x = 0; x < 24; x++) {
          if (!a.face(x, y)) continue
          const edge = !a.face(x - 1, y) || !a.face(x + 1, y) || y === a.chinY
          if (edge) g.set(x, y, c.main)
        }
    },
  }),
  t({
    id: 'muttonchops',
    name: '羊排鬓角',
    slot: 'beard',
    sex: 'm',
    weight: 4,
    swatches: BEARD,
    draw: ({ g, a, c }) => {
      for (let y = a.eyeY + 1; y <= a.mouthY + 1; y++)
        for (const x of [a.L, a.L + 1, a.R]) if (a.face(x, y)) g.set(x, y, c.main)
    },
  }),
  t({
    id: 'normal-beard',
    name: '短胡须',
    slot: 'beard',
    sex: 'm',
    weight: 5,
    swatches: BEARD,
    draw: ({ g, a, c }) => {
      for (const [x, y] of beardCells(a, a.mouthY + 1, true)) g.set(x, y, c.main)
    },
  }),
  t({
    id: 'full-beard',
    name: '大胡子',
    slot: 'beard',
    sex: 'm',
    weight: 4,
    swatches: BEARD,
    draw: ({ g, a, c, rng }) => {
      for (const [x, y] of beardCells(a, a.mouthY - 1, true)) g.set(x, y, rng() < 0.2 ? c.dark : c.main)
    },
  }),
  t({
    id: 'luxurious',
    name: '奢华长须',
    slot: 'beard',
    sex: 'm',
    weight: 2,
    swatches: BEARD,
    draw: ({ g, a, c, rng }) => {
      for (const [x, y] of beardCells(a, a.mouthY - 1, true)) g.set(x, y, rng() < 0.2 ? c.dark : c.main)
      for (let y = a.chinY + 1; y <= a.chinY + 3; y++)
        g.hline(y, a.L + (y - a.chinY - 1), a.R - 2 - (y - a.chinY), c.main)
    },
  }),
  t({
    id: 'shadow-beard',
    name: '胡茬',
    slot: 'beard',
    sex: 'm',
    weight: 6,
    draw: ({ g, a, skin }) => {
      for (const [x, y] of beardCells(a, a.mouthY - 1, true))
        if ((x + y) % 2 === 0) g.set(x, y, alpha(shade(skin.d, 0.6), 0.55))
    },
  }),
  t({
    id: 'front-beard',
    name: '下巴胡',
    slot: 'beard',
    sex: 'm',
    weight: 4,
    swatches: BEARD,
    draw: ({ g, a, c }) => {
      g.hline(a.mouthY - 1, a.mouthL - 1, a.mouthR + 1, c.main)
      for (let y = a.mouthY; y <= a.chinY + 1; y++)
        for (let x = a.mouthL - 1; x <= a.mouthR + 1; x++) {
          if (y === a.mouthY && x >= a.mouthL && x <= a.mouthR) continue
          if (a.face(x, y) || y === a.chinY + 1) g.set(x, y, c.main)
        }
    },
  }),
]

const mouth: Trait[] = [
  t({
    id: 'smile',
    name: '微笑',
    slot: 'mouth',
    weight: 7,
    draw: ({ g, a, skin }) => {
      g.set(a.mouthR + 1, a.mouthY - 1, skin.m)
      g.set(a.mouthL - 1, a.mouthY - 1, skin.m)
    },
  }),
  t({
    id: 'frown',
    name: '撇嘴',
    slot: 'mouth',
    weight: 5,
    draw: ({ g, a, skin }) => {
      g.set(a.mouthL - 1, a.mouthY + 1, skin.m)
      g.set(a.mouthR + 1, a.mouthY + 1, skin.m)
    },
  }),
  t({
    id: 'buck-teeth',
    name: '龅牙',
    slot: 'mouth',
    weight: 4,
    draw: ({ g, a }) => g.hline(a.mouthY + 1, a.mouthL, a.mouthL + 1, W),
  }),
  t({
    id: 'cigarette',
    name: '香烟',
    slot: 'mouth',
    weight: 7,
    draw: ({ g, a }) => {
      const x0 = a.mouthR + 1
      const y = a.mouthY
      withOutline(g, K, (l) => {
        l.hline(y, x0, x0 + 3, '#e3e3e3')
        l.set(x0 + 4, y, '#e2622b')
      })
      ;[0.7, 0.55, 0.45, 0.3].forEach((o, i) => g.set(x0 + 4 + (i % 2), y - 2 - i, alpha('#d0d0d0', o)))
    },
  }),
  t({
    id: 'pipe',
    name: '烟斗',
    slot: 'mouth',
    weight: 3,
    draw: ({ g, a }) => {
      const x0 = a.mouthR + 1
      const y = a.mouthY
      withOutline(g, K, (l) => {
        l.hline(y, x0, x0 + 2, '#6b4421')
        l.rect(x0 + 3, y - 2, 2, 3, '#8a5a2b')
        l.hline(y - 2, x0 + 3, x0 + 4, '#2e1c0c')
      })
      ;[0.6, 0.45, 0.3].forEach((o, i) => g.set(x0 + 3 + (i % 2), y - 4 - i, alpha('#d0d0d0', o)))
    },
  }),
  t({
    id: 'vape',
    name: '电子烟',
    slot: 'mouth',
    weight: 3,
    draw: ({ g, a }) => {
      const x0 = a.mouthR + 1
      withOutline(g, K, (l) => {
        l.hline(a.mouthY, x0, x0 + 4, '#5c5c5c')
        l.set(x0 + 5, a.mouthY, '#2bd4ff')
      })
    },
  }),
  t({
    id: 'medical-mask',
    name: '医用口罩',
    slot: 'mouth',
    weight: 3,
    draw: ({ g, a }) => {
      for (let y = a.eyeY + 3; y <= a.chinY; y++)
        for (let x = 0; x < 24; x++) if (a.face(x, y)) g.set(x, y, y % 2 ? '#e3ebf2' : '#c9d3dc')
      g.hline(a.eyeY + 2, a.earX, a.L - 1, '#c9d3dc')
    },
  }),
  t({
    id: 'bubblegum',
    name: '泡泡糖',
    slot: 'mouth',
    weight: 2,
    draw: ({ g, a }) => {
      const x = a.mouthR + 2
      g.hline(a.mouthY, x - 1, x + 1, '#ff7ac8')
      g.vline(x, a.mouthY - 1, a.mouthY + 1, '#ff7ac8')
      g.set(x, a.mouthY - 1, '#ffc2e6')
    },
  }),
  t({
    id: 'lipstick',
    name: '口红',
    slot: 'mouth',
    sex: 'f',
    weight: 8,
    swatches: LIPS,
    draw: ({ g, a, c }) => g.hline(a.mouthY, a.mouthL, a.mouthR, c.main),
  }),
]

const acc: Trait[] = [
  t({
    id: 'earring',
    name: '耳环',
    slot: 'acc',
    z: 4.5,
    weight: 8,
    swatches: METAL,
    draw: ({ g, a, c }) => g.set(a.earX, a.eyeY + 3, c.main),
  }),
  t({
    id: 'chain',
    name: '项链',
    slot: 'acc',
    weight: 4,
    swatches: METAL,
    draw: ({ g, a, c }) => {
      for (let x = a.L; x <= a.L + 4; x++) g.set(x, 22, x % 2 ? c.main : c.dark)
    },
  }),
  t({
    id: 'choker',
    name: '颈链',
    slot: 'acc',
    sex: 'f',
    weight: 4,
    draw: ({ g, a }) => g.hline(21, a.L, a.L + 3, K),
  }),
  t({
    id: 'mole',
    name: '痣',
    slot: 'acc',
    z: 1,
    weight: 4,
    draw: ({ g, a, skin }) => g.set(a.mouthR + 1, a.mouthY - 2, shade(skin.d, 0.6)),
  }),
  t({
    id: 'spots',
    name: '雀斑',
    slot: 'acc',
    z: 1,
    weight: 4,
    draw: ({ g, a, rng, skin }) => {
      let n = 0
      for (let i = 0; i < 80 && n < 7; i++) {
        const x = a.L + Math.floor(rng() * (a.R - a.L + 1))
        const y = a.top + 1 + Math.floor(rng() * (a.chinY - a.top - 1))
        if (g.get(x, y) !== skin.s || y === a.eyeY) continue
        g.set(x, y, shade(skin.s, 0.78))
        n++
      }
    },
  }),
  t({
    id: 'rosy',
    name: '腮红',
    slot: 'acc',
    z: 1,
    weight: 4,
    draw: ({ g, a }) => {
      g.hline(a.eyeY + 3, a.eyeL, a.eyeL + 1, alpha('#e8506a', 0.45))
      g.hline(a.eyeY + 3, a.eyeR + 1, a.eyeR + 2, alpha('#e8506a', 0.45))
    },
  }),
  t({
    id: 'clown-nose',
    name: '小丑鼻',
    slot: 'acc',
    z: 3.6,
    weight: 2,
    draw: ({ g, a }) => {
      g.rect(a.noseX, a.eyeY + 2, 2, 2, '#e02a2a')
      g.set(a.noseX, a.eyeY + 2, '#ff8a8a')
    },
  }),
]

export const TRAITS: Trait[] = [...head, ...eyes, ...beard, ...mouth, ...acc]
export const TRAIT_BY_ID: Record<string, Trait> = Object.fromEntries(TRAITS.map((x) => [x.id, x]))
