import { alpha } from '../color'
import { withOutline } from '../grid'
import { HAT, K, METAL, swatch, t, type Trait } from './kit'

const NEON = [swatch('红', '#ff3355'), swatch('青', '#22e3ff'), swatch('绿', '#3dff7a'), swatch('紫', '#b84dff')]

export const moreEyes: Trait[] = [
  t({
    id: 'round-glasses',
    name: '圆框眼镜',
    slot: 'eyes',
    weight: 5,
    swatches: [swatch('黑', '#1a1a1a'), ...METAL],
    draw: ({ g, a, c }) => {
      const Y = a.eyeY
      for (const e of [a.eyeL, a.eyeR]) {
        g.hline(Y - 1, e, e + 1, c.main)
        g.hline(Y + 1, e, e + 1, c.main)
        g.set(e - 1, Y, c.main)
        g.set(e + 2, Y, c.main)
      }
      g.hline(Y, a.eyeL + 3, a.eyeR - 2, c.main)
      g.hline(Y, a.L - 1, a.eyeL - 2, c.main)
    },
  }),
  t({
    id: 'monocle',
    name: '单片眼镜',
    slot: 'eyes',
    weight: 2,
    swatches: METAL,
    draw: ({ g, a, c }) => {
      const Y = a.eyeY
      const e = a.eyeR
      g.hline(Y - 1, e, e + 1, c.main)
      g.hline(Y + 1, e, e + 1, c.main)
      g.set(e - 1, Y, c.main)
      g.set(e + 2, Y, c.main)
      g.set(e, Y, alpha('#dff4ff', 0.6))
      for (let i = 1; i <= 6; i++) g.set(e + 2 + (i % 2), Y + i, i % 2 ? c.dark : c.main)
    },
  }),
  t({
    id: 'heart-glasses',
    name: '心形眼镜',
    slot: 'eyes',
    weight: 3,
    swatches: [swatch('粉', '#ff5fa2'), swatch('红', '#e02a2a'), swatch('紫', '#a855f7')],
    draw: ({ g, a, c }) => {
      const Y = a.eyeY
      g.hline(Y - 1, a.L - 1, a.eyeL - 3, K)
      withOutline(g, K, (l) => {
        for (const e of [a.eyeL, a.eyeR]) {
          const x0 = e - 1
          l.set(x0, Y - 1, c.light)
          l.set(x0 + 2, Y - 1, c.main)
          l.hline(Y, x0, x0 + 2, c.main)
          l.set(x0 + 1, Y + 1, c.dark)
        }
      })
    },
  }),
  t({
    id: 'ski-goggles',
    name: '滑雪镜',
    slot: 'eyes',
    weight: 3,
    swatches: [swatch('橙', '#ff8c1a'), swatch('蓝', '#2bb5ff'), swatch('紫', '#a855f7'), swatch('金', '#e8b923')],
    draw: ({ g, a, c }) => {
      const Y = a.eyeY
      g.hline(Y, a.L - 1, a.eyeL - 3, '#222222')
      withOutline(g, K, (l) => {
        l.hline(Y - 1, a.eyeL - 2, a.R + 1, c.light)
        l.hline(Y, a.eyeL - 2, a.R + 1, c.main)
        l.hline(Y + 1, a.eyeL - 2, a.R + 1, c.dark)
        l.set(11, Y + 1, K)
      })
    },
  }),
  t({
    id: 'cyber-visor',
    name: '赛博护目镜',
    slot: 'eyes',
    weight: 3,
    swatches: NEON,
    draw: ({ g, a, c }) => {
      const Y = a.eyeY
      g.hline(Y - 1, a.eyeL - 1, a.R + 1, K)
      g.hline(Y + 1, a.eyeL - 1, a.R + 1, K)
      g.hline(Y, a.L - 1, a.eyeL - 2, K)
      g.hline(Y, a.eyeL - 1, a.R + 1, c.main)
      g.set(a.eyeR, Y, c.light)
      g.hline(Y, a.R + 2, a.R + 3, alpha(c.main, 0.4))
    },
  }),
  t({
    id: 'sleep-mask',
    name: '睡眠眼罩',
    slot: 'eyes',
    weight: 2,
    swatches: [swatch('粉', '#f7a8c4'), swatch('蓝', '#8ec5ff'), swatch('黑', '#2a2a2a')],
    draw: ({ g, a, c }) => {
      const Y = a.eyeY
      g.rect(a.L - 1, Y - 1, a.R - a.L + 2, 3, c.main)
      g.hline(Y + 1, a.L - 1, a.R, c.dark)
      for (const e of [a.eyeL, a.eyeR]) {
        g.set(e - 1, Y - 1, K)
        g.hline(Y, e, e + 1, K)
        g.set(e + 2, Y - 1, K)
      }
    },
  }),
  t({
    id: 'eyeliner',
    name: '眼线',
    slot: 'eyes',
    sex: 'f',
    weight: 5,
    draw: ({ g, a }) => {
      for (const e of [a.eyeL, a.eyeR]) {
        g.hline(a.eyeY - 1, e, e + 1, K)
        g.set(e + 2, a.eyeY - 2, K)
      }
    },
  }),
  t({
    id: 'tears',
    name: '泪流满面',
    slot: 'eyes',
    weight: 2,
    draw: ({ g, a }) => {
      for (const e of [a.eyeL, a.eyeR]) for (let i = 1; i <= 3; i++) g.set(e, a.eyeY + i, alpha('#4aa8ff', 0.85 - i * 0.15))
    },
  }),
  t({
    id: 'aviators',
    name: '飞行员墨镜',
    slot: 'eyes',
    weight: 4,
    swatches: [swatch('金', '#b8860b'), swatch('绿', '#3b5e3b'), swatch('蓝', '#2a4a7a'), ...HAT.slice(0, 1)],
    draw: ({ g, a, c }) => {
      const Y = a.eyeY
      g.hline(Y - 1, a.L - 1, a.eyeR + 2, '#c8a64a')
      for (const e of [a.eyeL, a.eyeR]) {
        g.hline(Y, e - 1, e + 1, c.main)
        g.hline(Y + 1, e, e + 1, c.dark)
        g.set(e - 1, Y, c.light)
      }
    },
  }),
]
