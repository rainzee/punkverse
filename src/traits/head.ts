import { alpha, mix, shade } from '../color'
import { withOutline } from '../grid'
import { BEARD, cloud, type Anchors, HAIR, HAT, K, LENS, LIPS, METAL, one, SHADOW, straightHair, swatch, t, type Trait, W } from './kit'

export const classicHead: Trait[] = [
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
  t({ id: 'straight', name: '直长发', slot: 'head', sex: 'female', weight: 7, swatches: HAIR, draw: straightHair }),
  t({
    id: 'bob',
    name: '波波头',
    slot: 'head',
    sex: 'female',
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
    sex: 'female',
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
    sex: 'female',
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
    sex: 'female',
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
