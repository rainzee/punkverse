import { alpha } from '../color'
import { withOutline } from '../grid'
import { cloud, HAIR, HAT, K, one, straightHair, swatch, t, type Trait, W } from './kit'

const BONE = '#efe3c2'
const STEEL = '#9aa3ad'

export const moreHead: Trait[] = [
  t({
    id: 'bucket',
    name: '渔夫帽',
    slot: 'head',
    weight: 4,
    swatches: HAT,
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.hline(a.top - 3, a.L + 1, a.R - 1, c.main)
        l.rect(a.L, a.top - 2, a.R - a.L + 1, 2, c.main)
        l.hline(a.top - 1, a.L, a.R, c.dark)
        l.hline(a.top, a.L - 2, a.R + 2, c.main)
        l.set(a.L - 2, a.top + 1, c.main)
        l.set(a.R + 2, a.top + 1, c.main)
        l.set(a.L + 2, a.top - 2, c.light)
      }),
  }),
  t({
    id: 'beret',
    name: '贝雷帽',
    slot: 'head',
    weight: 3,
    swatches: HAT,
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.set(12, a.top - 4, c.dark)
        l.hline(a.top - 3, a.L + 1, a.R - 2, c.main)
        l.hline(a.top - 2, a.L - 1, a.R, c.main)
        l.hline(a.top - 1, a.L - 1, a.R - 1, c.main)
        l.hline(a.top, a.L, a.R - 2, c.dark)
        l.set(a.L + 2, a.top - 2, c.light)
      }),
  }),
  t({
    id: 'party',
    name: '派对帽',
    slot: 'head',
    weight: 2,
    swatches: HAT,
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.set(12, a.top - 8, W)
        for (let i = 0; i <= 6; i++) {
          const y = a.top - 7 + i
          for (let x = 12 - Math.floor((i + 1) / 2); x <= 12 + Math.floor(i / 2); x++)
            l.set(x, y, (x + y) % 3 === 0 ? W : c.main)
        }
      }),
  }),
  t({
    id: 'pirate',
    name: '海盗帽',
    slot: 'head',
    weight: 2,
    swatches: one('黑', '#1c1c1c'),
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.hline(a.top - 4, a.L + 2, a.R - 2, c.main)
        l.rect(a.L, a.top - 3, a.R - a.L + 1, 2, c.main)
        l.hline(a.top - 1, a.L - 3, a.R + 3, c.main)
        l.set(a.L - 3, a.top - 2, c.main)
        l.set(a.R + 3, a.top - 2, c.main)
        l.hline(a.top - 1, a.L - 2, a.R + 2, '#d4a017')
        l.hline(a.top - 3, 11, 12, W)
        l.set(10, a.top - 2, W)
        l.set(13, a.top - 2, W)
      }),
  }),
  t({
    id: 'dreads',
    name: '脏辫',
    slot: 'head',
    weight: 4,
    swatches: HAIR,
    draw: ({ g, a, c, rng }) => {
      g.rect(a.L - 1, a.top - 1, a.R - a.L + 3, 2, c.main)
      for (let x = a.L - 2; x <= a.R + 2; x++) {
        const side = x < a.L || x > a.R
        if (!side && x % 2) continue
        const len = side ? a.chinY - a.top + 1 - Math.floor(rng() * 4) : 2 + Math.floor(rng() * 2)
        for (let k = 0; k < len; k++) g.set(x, a.top + 1 + k, k % 3 === 2 ? c.light : x % 2 ? c.main : c.dark)
      }
    },
  }),
  t({
    id: 'curly',
    name: '卷发',
    slot: 'head',
    weight: 5,
    swatches: HAIR,
    draw: (ctx) => cloud(ctx, { up: 3, side: 2, down: ctx.a.eyeY + 2, cover: 1, jag: 0.35, curly: true }),
  }),
  t({
    id: 'middle-part',
    name: '中分',
    slot: 'head',
    weight: 5,
    swatches: HAIR,
    draw: ({ g, a, c, skin }) => {
      g.rect(a.L - 1, a.top - 1, a.R - a.L + 3, 3, c.main)
      g.vline(12, a.top, a.top + 1, skin.s)
      g.rect(a.L - 1, a.top + 2, 2, a.eyeY - a.top - 1, c.main)
      g.rect(a.R, a.top + 2, 2, a.eyeY - a.top - 1, c.main)
      g.hline(a.top + 2, a.L + 1, a.L + 2, c.main)
      g.hline(a.top + 2, a.R - 2, a.R - 1, c.main)
      g.set(a.L + 2, a.top, c.light)
    },
  }),
  t({
    id: 'side-part',
    name: '侧分',
    slot: 'head',
    sex: 'm',
    weight: 6,
    swatches: HAIR,
    draw: ({ g, a, c }) => {
      g.rect(a.L - 1, a.top - 1, a.R - a.L + 3, 2, c.main)
      g.hline(a.top + 1, a.L + 4, a.R + 1, c.main)
      g.hline(a.top + 2, a.L + 6, a.R + 1, c.main)
      g.vline(a.L - 1, a.top + 1, a.eyeY, c.main)
      g.set(a.L + 3, a.top, c.dark)
      g.hline(a.top - 1, a.L + 5, a.L + 7, c.light)
    },
  }),
  t({
    id: 'bald',
    name: '光头',
    slot: 'head',
    weight: 3,
    draw: ({ g, a }) => {
      g.set(a.L + 2, a.top + 1, alpha(W, 0.6))
      g.set(a.L + 3, a.top, alpha(W, 0.45))
      g.set(a.L + 2, a.top + 2, alpha(W, 0.3))
    },
  }),
  t({
    id: 'horns',
    name: '恶魔角',
    slot: 'head',
    weight: 2,
    swatches: [swatch('骨', BONE), swatch('红', '#b3261e'), swatch('黑', '#2a2a2a')],
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        for (const [x, dir] of [
          [a.L + 1, -1],
          [a.R - 1, 1],
        ]) {
          l.vline(x, a.top - 2, a.top - 1, c.main)
          l.set(x + dir, a.top - 2, c.main)
          l.set(x + dir, a.top - 3, c.light)
        }
      }),
  }),
  t({
    id: 'cat-ears',
    name: '猫耳',
    slot: 'head',
    weight: 2,
    swatches: HAIR,
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.hline(a.top, a.L, a.R, c.main)
        for (let i = 0; i < 4; i++) {
          l.hline(a.top - 1 - i, a.L, a.L + 3 - i, c.main)
          l.hline(a.top - 1 - i, a.R - 3 + i, a.R, c.main)
        }
        l.set(a.L + 1, a.top - 2, '#f29bb5')
        l.set(a.R - 1, a.top - 2, '#f29bb5')
      }),
  }),
  t({
    id: 'viking',
    name: '维京头盔',
    slot: 'head',
    weight: 2,
    draw: ({ g, a }) =>
      withOutline(g, K, (l) => {
        l.hline(a.top - 4, a.L + 2, a.R - 2, STEEL)
        l.hline(a.top - 3, a.L + 1, a.R - 1, STEEL)
        l.rect(a.L, a.top - 2, a.R - a.L + 1, 2, STEEL)
        l.hline(a.top, a.L, a.R, '#6d747c')
        l.vline(12, a.top - 4, a.top - 1, '#c9d0d6')
        for (const x of [a.L + 1, a.L + 4, a.R - 4, a.R - 1]) l.set(x, a.top, '#d8b34a')
        for (const [x, dir] of [
          [a.L - 1, -1],
          [a.R + 1, 1],
        ]) {
          l.set(x, a.top - 2, BONE)
          l.set(x + dir, a.top - 3, BONE)
          l.set(x + dir, a.top - 4, BONE)
          l.set(x + dir, a.top - 5, BONE)
        }
      }),
  }),
  t({
    id: 'chef',
    name: '厨师帽',
    slot: 'head',
    weight: 2,
    draw: ({ g, a }) =>
      withOutline(g, K, (l) => {
        l.hline(a.top - 7, a.L + 2, a.R - 2, W)
        l.rect(a.L, a.top - 6, a.R - a.L + 1, 3, W)
        l.hline(a.top - 5, a.L - 1, a.R + 1, W)
        l.rect(a.L + 1, a.top - 3, a.R - a.L - 1, 3, '#e4e4e4')
        for (const x of [a.L + 3, a.R - 3]) l.vline(x, a.top - 6, a.top - 4, '#d0d0d0')
      }),
  }),
  t({
    id: 'mortarboard',
    name: '学士帽',
    slot: 'head',
    weight: 1,
    swatches: [swatch('金', '#ffd23a'), swatch('红', '#c4271b'), swatch('蓝', '#2a6fe0')],
    draw: ({ g, a, c }) => {
      withOutline(g, K, (l) => {
        l.rect(a.L + 1, a.top - 1, a.R - a.L - 1, 2, '#1c1c1c')
        l.hline(a.top - 2, a.L - 3, a.R + 3, '#262626')
        l.hline(a.top - 3, a.L, a.R, '#262626')
        l.set(12, a.top - 3, c.main)
      })
      g.vline(a.R + 3, a.top - 1, a.top + 2, c.main)
      g.set(a.R + 3, a.top + 3, c.light)
    },
  }),
  t({
    id: 'bun',
    name: '丸子头',
    slot: 'head',
    sex: 'f',
    weight: 4,
    swatches: HAIR,
    draw: ({ g, a, c }) => {
      g.rect(a.L - 1, a.top - 1, a.R - a.L + 3, 2, c.main)
      g.hline(a.top + 1, a.L, a.L + 2, c.main)
      g.hline(a.top + 1, a.R - 1, a.R, c.main)
      g.vline(a.L - 1, a.top + 1, a.eyeY, c.main)
      g.hline(a.top - 5, 11, 12, c.main)
      g.rect(10, a.top - 4, 4, 2, c.main)
      g.set(11, a.top - 4, c.light)
      g.hline(a.top - 2, 11, 12, c.dark)
    },
  }),
  t({
    id: 'ponytail',
    name: '马尾',
    slot: 'head',
    sex: 'f',
    weight: 5,
    swatches: HAIR,
    draw: ({ g, a, c }) => {
      g.rect(a.L - 1, a.top - 1, a.R - a.L + 3, 2, c.main)
      g.hline(a.top + 1, a.L - 1, a.L + 1, c.main)
      g.vline(a.L - 1, a.top + 1, a.eyeY - 1, c.main)
      for (let k = 0; k < 9; k++) {
        const x = a.L - 2 - Math.min(k, 2)
        g.hline(a.top + 1 + k, x - 1, x, k % 3 === 1 ? c.dark : c.main)
      }
      g.set(a.L - 2, a.top + 1, c.light)
    },
  }),
  t({
    id: 'wavy',
    name: '波浪长发',
    slot: 'head',
    sex: 'f',
    weight: 5,
    swatches: HAIR,
    draw: (ctx) => {
      const { g, a, c } = ctx
      straightHair(ctx)
      for (let y = a.top; y <= a.chinY + 1; y++) {
        const wave = (y >> 1) % 2 === 1
        g.set(a.L - 2 + (wave ? 1 : 0), y, c.dark)
        if (wave) g.set(a.L - 3, y, c.main)
        if (y <= a.mouthY && wave) g.set(a.R + 2, y, c.main)
      }
    },
  }),
]
