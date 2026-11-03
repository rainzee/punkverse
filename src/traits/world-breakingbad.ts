import { alpha } from '../color'
import { withOutline } from '../grid'
import { BEARD, K, swatch, t, type Trait, W } from './kit'
import { body, dress, neck } from './outfit'

const WORLD = 'breakingbad'
const CRYSTAL = '#4fc3f7'

export const breakingBad: Trait[] = [
  t({
    id: 'porkpie',
    name: '海森堡帽',
    slot: 'head',
    world: WORLD,
    weight: 10,
    swatches: [swatch('黑', '#1c1c1c'), swatch('灰', '#4a4a4a')],
    draw: ({ g, a, c }) =>
      withOutline(g, K, (l) => {
        l.rect(a.L + 1, a.top - 3, a.R - a.L - 1, 2, c.main)
        l.hline(a.top - 3, a.L + 3, a.R - 3, c.light)
        l.hline(a.top - 1, a.L + 1, a.R - 1, '#0d0d0d')
        l.hline(a.top, a.L - 1, a.R + 1, c.main)
      }),
  }),
  t({
    id: 'teacher-glasses',
    name: '化学老师眼镜',
    slot: 'eyes',
    world: WORLD,
    weight: 8,
    swatches: [swatch('黑', '#1a1a1a'), swatch('银', '#9a9a9a'), swatch('棕', '#5a4632')],
    draw: ({ g, a, c }) => {
      const Y = a.eyeY
      for (const x0 of [a.eyeL - 1, a.eyeR - 1]) {
        g.hline(Y - 1, x0, x0 + 3, c.main)
        g.hline(Y + 1, x0, x0 + 3, alpha(c.main, 0.6))
        g.set(x0, Y, c.main)
        g.set(x0 + 3, Y, c.main)
        g.hline(Y, x0 + 1, x0 + 2, alpha(W, 0.2))
      }
      g.hline(Y - 1, a.L - 1, a.eyeR - 1, c.main)
    },
  }),
  t({
    id: 'heisenberg-goatee',
    name: '海森堡胡',
    slot: 'beard',
    sex: 'male',
    world: WORLD,
    weight: 10,
    swatches: BEARD,
    draw: ({ g, a, c }) => {
      g.hline(a.mouthY - 1, a.mouthL - 1, a.mouthR + 1, c.main)
      g.vline(a.mouthL - 1, a.mouthY, a.mouthY + 1, c.main)
      g.vline(a.mouthR + 1, a.mouthY, a.mouthY + 1, c.main)
      g.hline(a.mouthY + 2, a.mouthL - 1, a.mouthR + 1, c.main)
      g.hline(a.mouthY + 3, a.mouthL, a.mouthR, c.main)
    },
  }),
  t({
    id: 'respirator',
    name: '防毒半面罩',
    slot: 'mouth',
    world: WORLD,
    weight: 8,
    swatches: [swatch('紫', '#7b4fa0'), swatch('粉', '#e07aa0'), swatch('黄', '#e8c43a')],
    draw: ({ g, a, c }) => {
      g.hline(a.eyeY + 3, a.earX, a.mouthL - 3, '#2a2a2a')
      withOutline(g, K, (l) => {
        for (let y = a.eyeY + 3; y <= a.mouthY + 2; y++)
          for (let x = a.mouthL - 2; x <= a.R; x++) if (a.face(x, y)) l.set(x, y, (x + y) % 2 ? '#e0e0e0' : '#cfcfcf')
        l.rect(a.mouthL - 3, a.mouthY - 1, 2, 3, c.main)
        l.rect(a.R, a.mouthY - 1, 2, 3, c.main)
        l.set(a.mouthL - 3, a.mouthY - 1, c.light)
        l.set(a.R, a.mouthY - 1, c.light)
        l.set(a.noseX, a.mouthY, '#8a8a8a')
      })
    },
  }),
  t({
    id: 'hazmat',
    name: '黄色防护服',
    slot: 'outfit',
    world: WORLD,
    weight: 8,
    swatches: [swatch('黄', '#f2c230')],
    draw: ({ g, a, c }) => {
      const covered = (x: number, y: number) => {
        if ((a.face(x, y) && y <= a.chinY) || x < a.L - 3 || x > a.R + 3 || y < a.top - 3) return false
        if (y === a.top - 3) return x >= a.L && x <= a.R
        if (y === a.top - 2) return x >= a.L - 2 && x <= a.R + 2
        return true
      }
      const rim = (x: number, y: number) =>
        [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ].some(([i, j]) => a.face(i, j) && j <= a.chinY)
      withOutline(
        g,
        K,
        (l) => {
          for (let y = 0; y < 24; y++)
            for (let x = 0; x < 24; x++) {
              if (!covered(x, y)) continue
              l.set(x, y, rim(x, y) ? c.dark : (x * 5 + y) % 9 === 0 ? c.light : c.main)
            }
          l.vline(a.neckL + 2, a.chinY + 2, 23, '#9a9a9a')
        },
        (x, y) => a.face(x, y) && y <= a.chinY,
      )
    },
  }),
  t({
    id: 'loud-tie',
    name: '律师花领带',
    slot: 'outfit',
    world: WORLD,
    weight: 5,
    swatches: [swatch('红', '#d62828'), swatch('金', '#e8b923'), swatch('青绿', '#1fa39a'), swatch('粉', '#e05aa0')],
    draw: (ctx) => {
      const { a, c } = ctx
      dress(ctx, (x, y, cx) => {
        if (x === cx && y >= 22) return y % 2 ? c.light : c.main
        if (neck(a, x, y) && y >= 22) return '#b39ddb'
        if (y === 23 && Math.abs(x - cx) === 1) return '#b39ddb'
        if (y === 23 && Math.abs(x - cx) === 2) return '#5f6e85'
        return body(a, x, y) ? '#7f8fa6' : null
      })
    },
  }),
  t({
    id: 'khaki-jacket',
    name: '卡其夹克',
    slot: 'outfit',
    world: WORLD,
    weight: 6,
    draw: (ctx) => {
      const { a } = ctx
      dress(ctx, (x, y, cx) => {
        if (neck(a, x, y) && y >= 22) return '#6b8e4e'
        if (y === 22 && (x === a.neckL - 1 || x === a.neckR + 1)) return '#a8946a'
        if (y === 23 && x === cx) return '#8a7a5a'
        return body(a, x, y) ? '#c8b48a' : null
      })
    },
  }),
  t({
    id: 'manager',
    name: '快餐店经理制服',
    slot: 'outfit',
    sex: 'male',
    world: WORLD,
    weight: 3,
    draw: (ctx) => {
      const { g, a } = ctx
      dress(ctx, (x, y, cx) => {
        if (x === cx && y >= 22) return '#1c1c1c'
        if (neck(a, x, y) && y === 22) return '#f2d24c'
        return body(a, x, y) ? '#f2d24c' : null
      })
      g.set(a.R - 1, 23, W)
    },
  }),
  t({
    id: 'crystal-necklace',
    name: '蓝晶项链',
    slot: 'acc',
    world: WORLD,
    weight: 5,
    draw: ({ g, a }) => {
      const cx = Math.floor((a.neckL + a.neckR) / 2)
      g.set(a.neckL, 21, '#b0b0b0')
      g.set(a.neckR, 21, '#b0b0b0')
      g.set(cx, 22, '#bfe9ff')
      g.set(cx, 23, CRYSTAL)
    },
  }),
  t({
    id: 'sunburn',
    name: '沙漠晒伤',
    slot: 'acc',
    world: WORLD,
    z: 1,
    weight: 5,
    draw: ({ g, a }) => {
      const burn = alpha('#d9534f', 0.35)
      g.vline(a.noseX, a.eyeY + 2, a.eyeY + 3, burn)
      g.hline(a.eyeY + 2, a.eyeL, a.eyeL + 1, alpha('#d9534f', 0.25))
      g.hline(a.eyeY + 2, a.eyeR, a.eyeR + 1, alpha('#d9534f', 0.25))
    },
  }),
]
