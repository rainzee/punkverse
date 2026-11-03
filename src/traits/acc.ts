import { alpha, mix, shade } from '../color'
import { withOutline } from '../grid'
import { BEARD, cloud, type Anchors, HAIR, HAT, K, LENS, LIPS, METAL, one, SHADOW, straightHair, swatch, t, type Trait, W } from './kit'

export const classicAcc: Trait[] = [
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
    sex: 'female',
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
