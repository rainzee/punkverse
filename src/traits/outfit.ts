import { withOutline } from '../grid'
import type { Hex } from '../grid'
import { type Anchors, CLOTH, type DrawCtx, K, swatch, t, type Trait, W } from './kit'

const body = (a: Anchors, x: number, y: number) =>
  (y === 22 && x >= a.L - 1 && x <= a.R) || (y === 23 && x >= a.L - 2 && x <= a.R + 1)

const neck = (a: Anchors, x: number, y: number) => y > a.chinY && x >= a.neckL && x <= a.neckR

/** 在脖子与肩部区域按规则填色, 并为衣服加描边 */
function dress(ctx: DrawCtx, fill: (x: number, y: number, cx: number) => Hex | null) {
  const { g, a } = ctx
  const cx = Math.floor((a.neckL + a.neckR) / 2)
  withOutline(
    g,
    K,
    (l) => {
      for (let y = a.chinY + 1; y < 24; y++)
        for (let x = a.L - 3; x <= a.R + 3; x++) {
          const c = fill(x, y, cx)
          if (c) l.set(x, y, c)
        }
    },
    a.face,
  )
}

export const outfit: Trait[] = [
  t({
    id: 'tee',
    name: 'T 恤',
    slot: 'outfit',
    weight: 8,
    swatches: CLOTH,
    draw: (ctx) => {
      const { a, c } = ctx
      dress(ctx, (x, y) => {
        if (!body(a, x, y) || (y === 22 && neck(a, x, y))) return null
        return y === 22 && (x === a.neckL - 1 || x === a.neckR + 1) ? c.dark : c.main
      })
    },
  }),
  t({
    id: 'turtleneck',
    name: '高领毛衣',
    slot: 'outfit',
    weight: 4,
    swatches: CLOTH,
    draw: (ctx) => {
      const { a, c } = ctx
      dress(ctx, (x, y) => {
        if (neck(a, x, y)) return x % 2 ? c.main : c.dark
        return body(a, x, y) ? c.main : null
      })
    },
  }),
  t({
    id: 'shirt-tie',
    name: '衬衫领带',
    slot: 'outfit',
    weight: 4,
    swatches: CLOTH,
    draw: (ctx) => {
      const { a, c } = ctx
      dress(ctx, (x, y, cx) => {
        if (x === cx && y >= 22) return y === 22 ? c.dark : c.main
        if (y === 22 && (x === a.neckL || x === a.neckR)) return '#d6d6d6'
        if (y === 22 && neck(a, x, y)) return null
        return body(a, x, y) ? '#f2f2f2' : null
      })
    },
  }),
  t({
    id: 'suit',
    name: '西装',
    slot: 'outfit',
    weight: 3,
    swatches: [swatch('黑', '#222222'), swatch('藏青', '#1b2a5c'), swatch('灰', '#4a4a4a'), swatch('棕', '#5a3a1e')],
    draw: (ctx) => {
      const { a, c } = ctx
      dress(ctx, (x, y, cx) => {
        if (x === cx && y >= 22) return '#b3261e'
        if (y === 23 && Math.abs(x - cx) === 1) return W
        if (y === 22 && neck(a, x, y)) return W
        if (y === 23 && Math.abs(x - cx) === 2) return c.dark
        return body(a, x, y) ? c.main : null
      })
    },
  }),
  t({
    id: 'scarf',
    name: '围巾',
    slot: 'outfit',
    weight: 3,
    swatches: CLOTH,
    draw: (ctx) => {
      const { a, c } = ctx
      dress(ctx, (x, y) => {
        const band = y <= a.chinY + 2 && x >= a.neckL - 1 && x <= a.neckR + 1
        if (band) return x % 3 === 0 ? c.light : c.main
        if (y === 23 && (x === a.neckL + 1 || x === a.neckL + 2)) return c.dark
        return null
      })
    },
  }),
  t({
    id: 'bowtie',
    name: '领结',
    slot: 'outfit',
    weight: 3,
    swatches: CLOTH,
    draw: (ctx) => {
      const { a, c } = ctx
      dress(ctx, (x, y, cx) => {
        if (y === 22 && x === cx) return c.dark
        if (y >= 21 && y <= 22 && Math.abs(x - cx) === 1) return c.main
        if (y === 22 && neck(a, x, y)) return null
        return body(a, x, y) ? '#f2f2f2' : null
      })
    },
  }),
  t({
    id: 'leather',
    name: '皮夹克',
    slot: 'outfit',
    weight: 3,
    swatches: [swatch('黑', '#1f1f1f'), swatch('棕', '#5a3218')],
    draw: (ctx) => {
      const { a, c } = ctx
      dress(ctx, (x, y, cx) => {
        if (neck(a, x, y) && y >= 22) return x === cx && y === 23 ? '#bbbbbb' : W
        if (y === 22 && (x === a.neckL - 1 || x === a.neckR + 1)) return c.light
        return body(a, x, y) ? c.main : null
      })
    },
  }),
  t({
    id: 'sweater',
    name: '花纹毛衣',
    slot: 'outfit',
    weight: 3,
    swatches: CLOTH,
    draw: (ctx) => {
      const { a, c } = ctx
      dress(ctx, (x, y) => {
        if (neck(a, x, y)) return y === 23 ? c.dark : null
        if (!body(a, x, y)) return null
        return y === 23 && x % 3 === 0 ? W : c.main
      })
    },
  }),
  t({
    id: 'hawaiian',
    name: '花衬衫',
    slot: 'outfit',
    weight: 2,
    swatches: CLOTH,
    draw: (ctx) => {
      const { a, c } = ctx
      dress(ctx, (x, y) => {
        if (y === 22 && neck(a, x, y)) return null
        if (!body(a, x, y)) return null
        return (x * 7 + y * 3) % 5 === 0 ? '#ffd23a' : (x + y) % 4 === 0 ? c.light : c.main
      })
    },
  }),
]
