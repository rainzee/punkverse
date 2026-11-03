import { alpha, mix, shade } from '../color'
import { withOutline } from '../grid'
import { BEARD, cloud, type Anchors, HAIR, HAT, K, LENS, LIPS, METAL, one, SHADOW, straightHair, swatch, t, type Trait, W } from './kit'

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

export const classicBeard: Trait[] = [
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

export const classicMouth: Trait[] = [
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
    draw: ({ g, a, c, skin }) => {
      for (let y = a.mouthY; y <= a.mouthY + 1; y++)
        for (let x = a.mouthL - 1; x <= a.mouthR + 1; x++) if (g.get(x, y) === skin.m) g.set(x, y, c.main)
    },
  }),
]
