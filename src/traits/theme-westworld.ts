import { alpha, shade } from '../color'
import { withOutline } from '../grid'
import { HAIR, HAT, K, swatch, t, type Trait, W } from './kit'
import { body, dress, neck } from './outfit'

const THEME = 'westworld'
const GOLD = '#ffd23a'
const VEST = [swatch('鞍棕', '#5c4033'), swatch('黑', '#1f1a17'), swatch('酒红', '#5a1a1a'), swatch('灰', '#55504a')]

function vest(ctx: Parameters<Trait['draw']>[0]) {
  const { a, c } = ctx
  dress(ctx, (x, y, cx) => {
    if (neck(a, x, y) && y >= 22) return W
    if (y === 23 && Math.abs(x - cx) <= 1) return W
    if (y === 23 && x === cx + 2) return GOLD
    return body(a, x, y) ? c.main : null
  })
}

export const westworld: Trait[] = [
  t({
    id: 'stetson',
    name: '宽檐牛仔帽',
    slot: 'head',
    theme: THEME,
    weight: 14,
    swatches: [swatch('黑', '#1f1a17'), swatch('白', '#ece6d8'), swatch('沙色', '#c2a878'), swatch('棕', '#6b4423')],
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.hline(a.top - 5, a.L + 2, 10, c.main)
        l.hline(a.top - 5, 13, a.R - 2, c.main)
        l.rect(a.L + 1, a.top - 4, a.R - a.L - 1, 3, c.main)
        l.hline(a.top - 2, a.L + 1, a.R - 1, c.dark)
        l.hline(a.top - 1, a.L - 4, a.R + 4, c.main)
        l.set(a.L - 4, a.top - 2, c.main)
        l.set(a.R + 4, a.top - 2, c.main)
        l.set(a.L + 2, a.top - 4, c.light)
      }),
  }),
  t({
    id: 'straw-hat',
    name: '草帽',
    slot: 'head',
    theme: THEME,
    weight: 6,
    swatches: HAT.slice(0, 4),
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        const weave = (x: number, y: number) => ((x + y) % 2 ? '#e3c27a' : '#c9a55a')
        for (let y = a.top - 4; y <= a.top - 2; y++) for (let x = a.L + 1; x <= a.R - 1; x++) l.set(x, y, weave(x, y))
        l.hline(a.top - 2, a.L + 1, a.R - 1, c.main)
        for (let x = a.L - 4; x <= a.R + 4; x++) l.set(x, a.top - 1, weave(x, a.top - 1))
      }),
  }),
  t({
    id: 'braid',
    name: '侧编发辫',
    slot: 'head',
    sex: 'f',
    theme: THEME,
    weight: 8,
    swatches: HAIR.slice(0, 4),
    draw: ({ g, a, c }) => {
      g.rect(a.L - 1, a.top - 1, a.R - a.L + 3, 2, c.main)
      g.hline(a.top + 1, a.L + 3, a.R, c.main)
      g.rect(a.L - 2, a.top, 2, a.eyeY - a.top + 3, c.main)
      for (let y = a.eyeY + 3; y < 24; y++) {
        const x = a.L - 1 + ((y >> 1) % 2)
        g.set(x, y, y % 2 ? c.main : c.dark)
        g.set(x - 1, y, y % 2 ? c.dark : c.main)
      }
      g.set(a.L + 2, a.top - 1, c.light)
    },
  }),
  t({
    id: 'feather-band',
    name: '羽毛发带',
    slot: 'head',
    sex: 'f',
    theme: THEME,
    weight: 4,
    swatches: HAT.slice(0, 4),
    draw: ({ g, a, c }) => {
      g.rect(a.L - 1, a.top - 1, a.R - a.L + 3, 2, '#3b2416')
      g.vline(a.L - 1, a.top + 1, a.eyeY + 3, '#3b2416')
      g.hline(a.top + 1, a.L - 1, a.R + 1, c.main)
      for (let x = a.L; x <= a.R; x += 3) g.set(x, a.top + 1, W)
      g.vline(a.L + 1, a.top - 5, a.top, '#f2f2f2')
      g.vline(a.L + 2, a.top - 4, a.top - 1, c.light)
      g.set(a.L + 1, a.top - 6, c.dark)
    },
  }),
  t({
    id: 'squint',
    name: '枪手眯眼',
    slot: 'eyes',
    theme: THEME,
    weight: 10,
    draw: ({ g, a, skin }) => {
      for (const e of [a.eyeL, a.eyeR]) {
        g.set(e, a.eyeY, skin.d)
        g.hline(a.eyeY - 1, e - 1, e + 1, shade(skin.d, 0.6))
        g.set(e + 2, a.eyeY + 1, alpha(skin.d, 0.6))
      }
    },
  }),
  t({
    id: 'outlaw-bandana',
    name: '蒙面巾',
    slot: 'mouth',
    theme: THEME,
    weight: 8,
    swatches: [swatch('红', '#9e2a2a'), swatch('黑', '#1c1c1c'), swatch('靛蓝', '#2e3a59'), swatch('沙', '#c2a878')],
    draw: ({ g, a, c }) => {
      for (let y = a.eyeY + 2; y <= a.chinY; y++)
        for (let x = 0; x < 24; x++) if (a.face(x, y)) g.set(x, y, (x + y) % 3 === 0 ? c.light : c.main)
      g.hline(a.chinY + 1, a.mouthL - 1, a.mouthR, c.main)
      g.set(a.mouthL, a.chinY + 2, c.dark)
      g.set(a.earX, a.eyeY + 2, c.dark)
      g.set(a.earX - 1, a.eyeY + 3, c.main)
    },
  }),
  t({
    id: 'toothpick',
    name: '牙签',
    slot: 'mouth',
    theme: THEME,
    weight: 6,
    draw: ({ g, a }) => {
      g.hline(a.mouthY, a.mouthR + 1, a.mouthR + 2, '#d9b98a')
      g.set(a.mouthR + 3, a.mouthY - 1, '#d9b98a')
    },
  }),
  t({ id: 'vest', name: '马甲', slot: 'outfit', theme: THEME, weight: 10, swatches: VEST, draw: vest }),
  t({
    id: 'sheriff',
    name: '警长马甲',
    slot: 'outfit',
    theme: THEME,
    weight: 4,
    swatches: VEST,
    draw: (ctx) => {
      const { g, a } = ctx
      vest(ctx)
      g.set(a.R - 1, 22, GOLD)
      g.hline(23, a.R - 2, a.R, GOLD)
      g.set(a.R - 1, 23, '#c8961c')
    },
  }),
  t({
    id: 'poncho',
    name: '斗篷',
    slot: 'outfit',
    theme: THEME,
    weight: 6,
    swatches: [swatch('赭石', '#a0522d'), swatch('靛蓝', '#2e3a59'), swatch('褪红', '#9e3b2f')],
    draw: (ctx) => {
      const { a, c } = ctx
      dress(ctx, (x, y) => {
        if (neck(a, x, y) && y < 23) return null
        const inside =
          (y === 21 && x >= a.neckL - 1 && x <= a.neckR + 1) ||
          (y === 22 && x >= a.L - 2 && x <= a.R + 1) ||
          (y === 23 && x >= a.L - 3 && x <= a.R + 3)
        if (!inside) return null
        return x % 4 === 0 ? '#f2e6c9' : x % 4 === 2 ? c.dark : c.main
      })
    },
  }),
  t({
    id: 'lace-collar',
    name: '蕾丝高领',
    slot: 'outfit',
    sex: 'f',
    theme: THEME,
    weight: 7,
    swatches: [swatch('墨绿', '#2f4f3f'), swatch('酒红', '#5a1a24'), swatch('藏青', '#1b2a5c'), swatch('黑', '#1c1c1c')],
    draw: (ctx) => {
      const { a, c } = ctx
      dress(ctx, (x, y) => {
        if (neck(a, x, y)) return (x + y) % 2 ? W : '#e6e0d6'
        return body(a, x, y) ? c.main : null
      })
    },
  }),
  t({
    id: 'host-reveal',
    name: '机体外露',
    slot: 'acc',
    theme: THEME,
    z: 3.8,
    weight: 5,
    draw: ({ g, a }) => {
      for (let y = a.eyeY + 1; y < a.mouthY; y++)
        for (let x = a.eyeR - 1; x <= a.R; x++) if (a.face(x, y)) g.set(x, y, y % 2 ? '#f4f3ee' : '#d6d5cc')
      g.set(a.eyeR, a.eyeY + 2, '#9aa3ad')
    },
  }),
  t({
    id: 'dust',
    name: '风尘',
    slot: 'acc',
    theme: THEME,
    z: 1,
    weight: 6,
    draw: ({ g, a, rng }) => {
      for (let i = 0; i < 10; i++) {
        const x = a.L + Math.floor(rng() * (a.R - a.L + 1))
        const y = a.top + Math.floor(rng() * (a.chinY - a.top + 1))
        if (a.face(x, y) && y !== a.eyeY) g.set(x, y, alpha('#7a5a3a', 0.4))
      }
    },
  }),
]
