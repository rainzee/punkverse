import { alpha } from '../color'
import { withOutline } from '../grid'
import { BEARD, HAT, K, t, type Trait, W } from './kit'

export const moreBeard: Trait[] = [
  t({
    id: 'pencil',
    name: '细胡',
    slot: 'beard',
    sex: 'male',
    weight: 4,
    swatches: BEARD,
    draw: ({ g, a, c }) => {
      g.set(a.mouthL - 1, a.mouthY, c.main)
      g.hline(a.mouthY - 1, a.mouthL, a.mouthR, c.main)
      g.set(a.mouthR + 1, a.mouthY, c.main)
    },
  }),
  t({
    id: 'sideburns',
    name: '鬓角',
    slot: 'beard',
    sex: 'male',
    weight: 4,
    swatches: BEARD,
    draw: ({ g, a, c }) => {
      for (let y = a.eyeY + 1; y < a.mouthY; y++) for (const x of [a.L, a.L + 1]) if (a.face(x, y)) g.set(x, y, c.main)
    },
  }),
  t({
    id: 'soul-patch',
    name: '唇下胡',
    slot: 'beard',
    sex: 'male',
    weight: 3,
    swatches: BEARD,
    draw: ({ g, a, c }) => g.vline(a.mouthL + 1, a.mouthY + 1, a.mouthY + 2, c.main),
  }),
  t({
    id: 'van-dyke',
    name: '范戴克胡',
    slot: 'beard',
    sex: 'male',
    weight: 3,
    swatches: BEARD,
    draw: ({ g, a, c }) => {
      g.hline(a.mouthY - 1, a.mouthL - 1, a.mouthR + 1, c.main)
      g.vline(a.mouthL + 1, a.mouthY + 1, a.chinY + 1, c.main)
      g.hline(a.mouthY + 2, a.mouthL, a.mouthR, c.main)
    },
  }),
  t({
    id: 'braided',
    name: '编辫胡',
    slot: 'beard',
    sex: 'male',
    weight: 2,
    swatches: BEARD,
    draw: ({ g, a, c }) => {
      for (let y = a.mouthY - 1; y <= a.chinY; y++)
        for (let x = 0; x < 24; x++) {
          if (!a.face(x, y) || (y === a.mouthY && x >= a.mouthL && x <= a.mouthR)) continue
          g.set(x, y, c.main)
        }
      for (let y = a.chinY + 1; y <= 23; y++) {
        g.hline(y, a.mouthL, a.mouthL + 1, y % 2 ? c.main : c.dark)
      }
      g.hline(23, a.mouthL, a.mouthL + 1, c.light)
    },
  }),
]

export const moreMouth: Trait[] = [
  t({
    id: 'cigar',
    name: '雪茄',
    slot: 'mouth',
    weight: 3,
    draw: ({ g, a }) => {
      const x0 = a.mouthR + 1
      const y = a.mouthY
      withOutline(g, K, (l) => {
        l.hline(y, x0, x0 + 4, '#7a4a1e')
        l.set(x0 + 1, y, '#c4271b')
        l.set(x0 + 5, y, '#ff7a2b')
      })
      ;[0.65, 0.5, 0.35].forEach((o, i) => g.set(x0 + 5 + (i % 2), y - 2 - i, alpha('#d0d0d0', o)))
    },
  }),
  t({
    id: 'lollipop',
    name: '棒棒糖',
    slot: 'mouth',
    weight: 2,
    swatches: HAT.filter((s) => !['黑', '灰', '棕'].includes(s.name)),
    draw: ({ g, a, c }) => {
      const x0 = a.mouthR + 1
      const y = a.mouthY
      g.hline(y, x0, x0 + 2, W)
      withOutline(g, K, (l) => {
        l.hline(y - 1, x0 + 3, x0 + 5, c.main)
        l.vline(x0 + 4, y - 2, y, c.main)
        l.set(x0 + 4, y - 1, W)
      })
    },
  }),
  t({
    id: 'fangs',
    name: '獠牙',
    slot: 'mouth',
    weight: 3,
    draw: ({ g, a }) => {
      g.set(a.mouthL, a.mouthY + 1, W)
      g.set(a.mouthR, a.mouthY + 1, W)
    },
  }),
  t({
    id: 'tongue',
    name: '吐舌头',
    slot: 'mouth',
    weight: 3,
    draw: ({ g, a }) => {
      g.hline(a.mouthY + 1, a.mouthL + 1, a.mouthL + 2, '#e8708a')
      g.set(a.mouthL + 1, a.mouthY + 2, '#d45670')
    },
  }),
  t({
    id: 'rose',
    name: '玫瑰',
    slot: 'mouth',
    weight: 2,
    draw: ({ g, a }) => {
      const x0 = a.mouthR + 1
      const y = a.mouthY
      withOutline(g, K, (l) => {
        l.hline(y, x0, x0 + 3, '#2e7d32')
        l.set(x0 + 2, y + 1, '#4caf50')
        l.rect(x0 + 4, y - 1, 2, 2, '#c81e1e')
        l.set(x0 + 4, y - 1, '#ff4d6d')
      })
    },
  }),
  t({
    id: 'straw',
    name: '麦秆',
    slot: 'mouth',
    weight: 2,
    draw: ({ g, a }) => {
      const x0 = a.mouthR + 1
      for (let i = 0; i <= 5; i++) g.set(x0 + i, a.mouthY - Math.floor(i / 2), i === 5 ? '#c9a24a' : '#e8c76a')
    },
  }),
  t({
    id: 'grill',
    name: '金牙',
    slot: 'mouth',
    weight: 2,
    draw: ({ g, a }) => {
      for (let x = a.mouthL; x <= a.mouthR; x++) g.set(x, a.mouthY, x % 2 ? '#ffd23a' : '#c8961c')
    },
  }),
  t({
    id: 'gas-mask',
    name: '防毒面具',
    slot: 'mouth',
    weight: 1,
    draw: ({ g, a }) => {
      for (let y = a.eyeY + 2; y <= a.chinY; y++)
        for (let x = 0; x < 24; x++) if (a.face(x, y)) g.set(x, y, (x + y) % 4 ? '#3d4a3d' : '#4d5c4d')
      g.hline(a.eyeY + 2, a.earX, a.L - 1, '#222222')
      withOutline(g, K, (l) => {
        l.rect(a.mouthR, a.mouthY - 1, 3, 3, '#6b7a6b')
        l.set(a.mouthR + 1, a.mouthY, '#2a332a')
      })
    },
  }),
]
