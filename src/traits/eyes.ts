import { alpha, mix, shade } from '../color'
import { withOutline } from '../grid'
import { BEARD, cloud, type Anchors, HAIR, HAT, K, LENS, LIPS, METAL, one, SHADOW, straightHair, swatch, t, type Trait, W } from './kit'

export const classicEyes: Trait[] = [
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
    sex: 'female',
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
