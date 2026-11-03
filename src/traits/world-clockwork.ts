import { alpha } from '../color'
import { withOutline } from '../grid'
import { K, swatch, t, type Trait, W } from './kit'
import { body, dress, neck } from './outfit'

const WORLD = 'clockwork'
const MILK = '#f4f1ea'
const STEEL = '#c8c8c8'
const MOD = [swatch('紫', '#9b4dff'), swatch('青', '#2ec4b6'), swatch('橙', '#f28c28'), swatch('粉', '#ff4fa3')]

export const clockwork: Trait[] = [
  t({
    id: 'bowler',
    name: '圆顶礼帽',
    slot: 'head',
    world: WORLD,
    weight: 12,
    swatches: [swatch('黑', '#2a2a2a')],
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.hline(a.top - 4, a.L + 3, a.R - 3, c.main)
        l.hline(a.top - 3, a.L + 2, a.R - 2, c.main)
        l.hline(a.top - 2, a.L + 1, a.R - 1, c.main)
        l.hline(a.top - 1, a.L + 1, a.R - 1, '#111111')
        l.hline(a.top, a.L - 1, a.R + 1, c.main)
        l.hline(a.top - 3, a.L + 3, a.L + 4, '#5a5a5a')
      }),
  }),
  t({
    id: 'mod-wig',
    name: '摩登假发',
    slot: 'head',
    sex: 'female',
    world: WORLD,
    weight: 10,
    swatches: [...MOD, swatch('银', '#d9d9d9')],
    draw: ({ g, a, c }) => {
      g.hline(a.top - 4, a.L, a.R, c.main)
      g.rect(a.L - 2, a.top - 3, a.R - a.L + 5, 3, c.main)
      g.rect(a.L - 2, a.top, 3, a.mouthY - a.top + 1, c.main)
      g.rect(a.R, a.top, 3, a.mouthY - a.top + 1, c.main)
      g.rect(a.L, a.top, a.R - a.L + 1, 3, c.main)
      g.set(a.L - 3, a.mouthY, c.main)
      g.set(a.R + 3, a.mouthY, c.main)
      g.hline(a.top - 3, a.L + 1, a.L + 3, c.light)
      g.hline(a.top + 2, a.L, a.R, c.dark)
    },
  }),
  t({
    id: 'false-lashes',
    name: '单眼假睫毛',
    slot: 'eyes',
    world: WORLD,
    weight: 14,
    draw: ({ g, a }) => {
      const e = a.eyeL
      const Y = a.eyeY
      g.set(e, Y, W)
      g.hline(Y - 1, e, e + 1, K)
      for (const [x, y] of [
        [e - 1, Y - 1],
        [e, Y - 2],
        [e + 1, Y - 2],
        [e + 2, Y - 1],
        [e - 1, Y + 1],
        [e, Y + 2],
        [e + 2, Y + 1],
      ])
        g.set(x, y, K)
    },
  }),
  t({
    id: 'ludovico',
    name: '开睑器',
    slot: 'eyes',
    world: WORLD,
    weight: 6,
    draw: ({ g, a }) => {
      const Y = a.eyeY
      for (const e of [a.eyeL, a.eyeR]) {
        g.set(e, Y, W)
        g.set(e + 1, Y, K)
        g.vline(e - 1, Y - 2, Y - 1, STEEL)
        g.vline(e + 2, Y - 2, Y - 1, STEEL)
        g.set(e - 1, Y + 1, STEEL)
        g.set(e + 2, Y + 1, STEEL)
        g.set(e, Y + 1, alpha('#d94040', 0.5))
      }
    },
  }),
  t({
    id: 'nose-mask',
    name: '长鼻面具',
    slot: 'eyes',
    world: WORLD,
    weight: 6,
    swatches: [swatch('白', MILK), swatch('红', '#c4271b'), swatch('黑', '#1c1c1c'), swatch('紫', '#6a2bb3')],
    draw: ({ g, a, c }) => {
      const Y = a.eyeY
      withOutline(g, K, (l) => {
        l.rect(a.L, Y - 2, a.R - a.L + 1, 4, c.main)
        l.hline(Y + 2, a.noseX - 1, a.R, c.main)
        l.hline(Y + 1, a.R + 1, a.R + 2, c.main)
        l.hline(Y + 2, a.R + 1, a.R + 4, c.main)
        l.set(a.R + 4, Y + 2, c.dark)
        for (const e of [a.eyeL, a.eyeR]) l.hline(Y, e, e + 1, null)
      })
      for (const e of [a.eyeL, a.eyeR]) {
        g.set(e, Y, W)
        g.set(e + 1, Y, K)
      }
    },
  }),
  t({
    id: 'moloko',
    name: '牛奶胡',
    slot: 'mouth',
    world: WORLD,
    weight: 8,
    draw: ({ g, a }) => {
      g.hline(a.mouthY - 1, a.mouthL - 1, a.mouthR + 1, alpha(W, 0.85))
      g.set(a.mouthR + 1, a.mouthY, alpha(W, 0.7))
    },
  }),
  t({
    id: 'droog-whites',
    name: '白衣背带',
    slot: 'outfit',
    world: WORLD,
    weight: 12,
    draw: (ctx) => {
      const { a } = ctx
      dress(ctx, (x, y, cx) => {
        if (y === 22 && neck(a, x, y)) return null
        if (!body(a, x, y)) return null
        return x === cx - 3 || x === cx + 4 ? K : MILK
      })
    },
  }),
  t({
    id: 'mod-dress',
    name: '摩登连衣裙',
    slot: 'outfit',
    sex: 'female',
    world: WORLD,
    weight: 8,
    swatches: MOD,
    draw: (ctx) => {
      const { a, c } = ctx
      dress(ctx, (x, y) => {
        if (y === 22 && neck(a, x, y)) return null
        if (!body(a, x, y)) return null
        return x % 3 === 0 ? c.light : c.main
      })
    },
  }),
  t({
    id: 'eyeball-earring',
    name: '眼球耳坠',
    slot: 'acc',
    world: WORLD,
    weight: 6,
    draw: ({ g, a }) => {
      g.set(a.earX, a.eyeY + 3, STEEL)
      g.set(a.earX - 1, a.eyeY + 4, W)
      g.set(a.earX, a.eyeY + 4, '#2a6fe0')
    },
  }),
]
