import { alpha } from '../color'
import { withOutline } from '../grid'
import { K, swatch, t, type Trait, W } from './kit'
import { body, dress, neck } from './outfit'

const WORLD = 'bladerunner'
const NEON = [swatch('霓虹粉', '#ff2e88'), swatch('青', '#00e5ff'), swatch('琥珀', '#ffb347'), swatch('血橙', '#ff5a1f')]

export const bladeRunner: Trait[] = [
  t({
    id: 'neon-umbrella',
    name: '霓虹伞',
    slot: 'head',
    world: WORLD,
    weight: 6,
    swatches: NEON,
    draw: ({ g, a, c }) => {
      const spans = [
        [9, 14],
        [7, 16],
        [5, 18],
        [4, 19],
      ]
      spans.forEach(([x0, x1], i) => g.hline(a.top - 6 + i, x0, x1, alpha('#14161f', 0.92)))
      g.hline(a.top - 3, 4, 19, c.main)
      g.set(12, a.top - 7, c.light)
      for (let y = a.top - 2; y < 24; y++) g.set(a.R + 3, y, y % 3 ? c.light : c.main)
    },
  }),
  t({
    id: 'platinum-crop',
    name: '铂金短发',
    slot: 'head',
    world: WORLD,
    weight: 6,
    swatches: [swatch('铂金', '#f4f1e4'), swatch('银白', '#d9dde3')],
    draw: ({ g, a, c, rng }) => {
      for (let y = a.top - 2; y <= a.top + 2; y++)
        for (let x = a.L - 1; x <= a.R + 1; x++) {
          const edge = y === a.top - 2 || y === a.top + 2 || x === a.L - 1 || x === a.R + 1
          if (y > a.top && x >= a.L + 1 && x <= a.R - 1 && y === a.top + 2) continue
          if (edge && rng() < 0.45) continue
          g.set(x, y, rng() < 0.2 ? c.dark : c.main)
        }
    },
  }),
  t({
    id: 'victory-rolls',
    name: '复古盘发',
    slot: 'head',
    sex: 'female',
    world: WORLD,
    weight: 6,
    swatches: [swatch('黑', '#1a1412'), swatch('深棕', '#3b2416')],
    draw: ({ g, a, c }) => {
      g.rect(a.L - 1, a.top - 1, a.R - a.L + 3, 2, c.main)
      for (const x0 of [a.L, a.R - 2]) {
        g.rect(x0, a.top - 3, 3, 2, c.main)
        g.set(x0 + 1, a.top - 3, c.light)
        g.set(x0 + 1, a.top - 2, c.dark)
      }
      for (let y = a.top + 1; y <= a.eyeY + 2; y++) {
        g.set(a.L - 1, y, c.main)
        g.set(a.L - 2, y, y % 2 ? c.dark : c.main)
      }
      for (let y = a.top + 1; y <= a.eyeY; y++) g.set(a.R + 1, y, c.main)
    },
  }),
  t({
    id: 'replicant',
    name: '复制人瞳光',
    slot: 'eyes',
    world: WORLD,
    weight: 12,
    draw: ({ g, a }) => {
      for (const e of [a.eyeL, a.eyeR]) {
        g.set(e, a.eyeY, alpha('#ffb37a', 0.6))
        g.set(e + 1, a.eyeY, '#ff7a2b')
      }
    },
  }),
  t({
    id: 'spray-mask',
    name: '喷漆眼妆',
    slot: 'eyes',
    world: WORLD,
    weight: 5,
    draw: ({ g, a }) => {
      g.rect(a.L, a.eyeY - 1, a.R - a.L + 1, 2, alpha('#0a0a0a', 0.88))
      g.hline(a.eyeY + 1, a.L, a.R, alpha('#0a0a0a', 0.35))
      for (const e of [a.eyeL, a.eyeR]) g.set(e, a.eyeY, W)
    },
  }),
  t({
    id: 'neon-smoke',
    name: '霓虹烟',
    slot: 'mouth',
    world: WORLD,
    weight: 6,
    swatches: NEON,
    draw: ({ g, a, c }) => {
      const x0 = a.mouthR + 1
      const y = a.mouthY
      withOutline(g, K, (l) => {
        l.hline(y, x0, x0 + 3, '#e3e3e3')
        l.set(x0 + 4, y, c.main)
      })
      ;[0.8, 0.65, 0.55, 0.45, 0.35, 0.25].forEach((o, i) => g.set(x0 + 4 + (i % 3 === 1 ? 1 : 0), y - 2 - i, alpha(c.main, o)))
    },
  }),
  t({
    id: 'trench',
    name: '风衣立领',
    slot: 'outfit',
    world: WORLD,
    weight: 10,
    swatches: [swatch('卡其', '#8a7350'), swatch('深棕', '#3e2c1c'), swatch('黑', '#1c1c1c')],
    draw: (ctx) => {
      const { a, c } = ctx
      dress(ctx, (x, y, cx) => {
        if ((x === a.neckL - 1 || x === a.neckR + 1) && y >= 21 && y <= 22) return c.light
        if (neck(a, x, y) && y >= 22) return '#222222'
        if (y === 23 && x === cx + 2) return c.dark
        return body(a, x, y) ? c.main : null
      })
    },
  }),
  t({
    id: 'raincoat',
    name: '透明雨衣',
    slot: 'outfit',
    world: WORLD,
    weight: 6,
    draw: (ctx) => {
      const { a } = ctx
      dress(ctx, (x, y) => {
        if ((x === a.neckL - 1 || x === a.neckR + 1) && y >= 21 && y <= 22) return alpha(W, 0.5)
        if (!body(a, x, y)) return null
        return (x + y) % 4 === 0 ? alpha(W, 0.55) : alpha('#cfe8ff', 0.35)
      })
    },
  }),
  t({
    id: 'shoulder-pads',
    name: '垫肩套装',
    slot: 'outfit',
    sex: 'female',
    world: WORLD,
    weight: 6,
    swatches: [swatch('黑', '#1c1c1c'), swatch('酒红', '#5a1a24'), swatch('烟灰', '#3b3f4a')],
    draw: (ctx) => {
      const { a, c } = ctx
      dress(ctx, (x, y) => {
        if (neck(a, x, y)) return null
        if (y === 22 && (x === a.L - 3 || x === a.R + 2)) return c.light
        if (y === 22 && x >= a.L - 3 && x <= a.R + 2) return c.main
        if (y === 23 && x >= a.L - 3 && x <= a.R + 3) return c.main
        return null
      })
    },
  }),
  t({
    id: 'led-collar',
    name: '发光颈环',
    slot: 'acc',
    world: WORLD,
    weight: 5,
    swatches: NEON,
    draw: ({ g, a, c }) => {
      g.hline(21, a.neckL, a.neckR, c.main)
      g.set(a.neckL + 1, 21, c.light)
    },
  }),
]
