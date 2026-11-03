import { alpha } from '../color'
import { withOutline } from '../grid'
import { HAT, K, METAL, PAINT, t, type Trait } from './kit'

export const moreAcc: Trait[] = [
  t({
    id: 'headphones',
    name: '耳机',
    slot: 'acc',
    z: 5.5,
    weight: 4,
    swatches: HAT,
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        const band = '#2a2a2a'
        l.hline(a.top - 2, a.L + 1, a.R - 1, band)
        l.set(a.L, a.top - 1, band)
        l.set(a.R, a.top - 1, band)
        l.vline(a.L - 1, a.top, a.eyeY - 2, band)
        l.vline(a.R + 1, a.top, a.eyeY - 2, band)
        l.rect(a.earX - 1, a.eyeY - 1, 2, 4, c.main)
        l.rect(a.R + 1, a.eyeY - 1, 2, 4, c.main)
        l.set(a.earX - 1, a.eyeY - 1, c.light)
      }),
  }),
  t({
    id: 'nose-ring',
    name: '鼻环',
    slot: 'acc',
    weight: 3,
    swatches: METAL,
    draw: ({ g, a, c }) => g.set(a.noseX + 1, a.eyeY + 3, c.main),
  }),
  t({
    id: 'teardrop',
    name: '泪滴纹身',
    slot: 'acc',
    z: 1,
    weight: 2,
    draw: ({ g, a }) => g.set(a.eyeL, a.eyeY + 2, '#1d3d9e'),
  }),
  t({
    id: 'scar',
    name: '刀疤',
    slot: 'acc',
    z: 1,
    weight: 3,
    draw: ({ g, a }) => {
      const Y = a.eyeY
      for (const [x, y] of [
        [a.eyeL + 2, Y - 2],
        [a.eyeL + 1, Y - 1],
        [a.eyeL, Y + 1],
        [a.eyeL - 1, Y + 2],
      ])
        g.set(x, y, alpha('#a83232', 0.75))
    },
  }),
  t({
    id: 'bandaid',
    name: '创可贴',
    slot: 'acc',
    z: 1,
    weight: 2,
    draw: ({ g, a }) => {
      g.rect(a.R - 2, a.eyeY + 3, 2, 2, '#e8c39a')
      g.set(a.R - 2, a.eyeY + 3, '#f3dcc0')
    },
  }),
  t({
    id: 'brow-piercing',
    name: '眉钉',
    slot: 'acc',
    weight: 2,
    swatches: METAL,
    draw: ({ g, a, c }) => g.set(a.eyeR + 1, a.eyeY - 2, c.main),
  }),
  t({
    id: 'war-paint',
    name: '战纹',
    slot: 'acc',
    z: 1,
    weight: 2,
    swatches: PAINT,
    draw: ({ g, a, c }) => {
      for (const e of [a.eyeL, a.eyeR]) {
        g.hline(a.eyeY + 2, e - 1, e + 1, c.main)
        g.hline(a.eyeY + 4, e, e + 1, c.main)
      }
    },
  }),
  t({
    id: 'star-tattoo',
    name: '星星纹身',
    slot: 'acc',
    z: 1,
    weight: 2,
    swatches: PAINT,
    draw: ({ g, a, c }) => {
      const x = a.eyeR + 1
      const y = a.eyeY + 3
      g.set(x, y, c.main)
      g.set(x, y - 1, alpha(c.main, 0.5))
      g.set(x - 1, y, alpha(c.main, 0.5))
      g.set(x + 1, y, alpha(c.main, 0.5))
      g.set(x, y + 1, alpha(c.main, 0.5))
    },
  }),
]
