import { fromHsl, hex, shade } from './color'
import {
  decorateAlien,
  decorateApe,
  decorateDemon,
  decorateRobot,
  decorateSkeleton,
  type FaceShape,
  rollFace,
  shapeFace,
} from './features'
import { Grid, SIZE } from './grid'
import { makeRng, weighted } from './rng'
import { inTheme, type Theme, themedWeight, themeOf } from './themes'
import {
  type Anchors,
  type Sex,
  type SkinPalette,
  type Slot,
  type Swatch,
  swatch,
  type Trait,
  TRAIT_BY_ID,
  TRAITS,
} from './traits'

export type Kind = 'male' | 'female' | 'zombie' | 'ape' | 'alien' | 'robot' | 'skeleton' | 'demon'

/** 头像种族 */
export interface KindInfo {
  id: Kind
  name: string
  sex: Sex
  weight: number
  skins: { name: string; skin: SkinPalette }[]
}

/** 已选中的部件及其配色 */
export interface Picked {
  trait: Trait
  swatch: Swatch
}

/** 一个生成好的头像 */
export interface Punk {
  seed: string
  kind: Kind
  skinIndex: number
  theme: string
  face: FaceShape
  picks: Picked[]
}

/** 生成约束, 部件取值为 random none 或具体部件 id */
export interface GenOptions {
  theme: string
  kind: Kind | 'random'
  skin: number | 'random'
  slots: Record<Slot, string>
}

export const SLOTS: Slot[] = ['head', 'eyes', 'beard', 'mouth', 'outfit', 'acc']
export const SLOT_NAMES: Record<Slot, string> = { head: '头部', eyes: '眼部', beard: '胡须', mouth: '嘴部', outfit: '衣着', acc: '配饰' }
const SLOT_CHANCE: Record<Slot, number> = { head: 0.9, eyes: 0.42, beard: 0.45, mouth: 0.4, outfit: 0.4, acc: 0 }

const human = (s: string, d: string, sex: Sex): SkinPalette => ({
  s,
  d,
  w: shade(s, 0.72),
  p: '#000000',
  m: sex === 'f' ? '#711010' : shade(s, 0.45),
})
const TONES: [string, string, string][] = [
  ['白皙', '#ead9d9', '#c9b2b2'],
  ['浅', '#f1c8a5', '#c99a74'],
  ['小麦', '#dbb180', '#a77c47'],
  ['中', '#ae8b61', '#86581e'],
  ['棕', '#8d5524', '#64390f'],
  ['深', '#713f1d', '#562600'],
]

const palette = (name: string, s: string, d: string, w: string, p: string, m: string) => ({
  name,
  skin: { s, d, w, p, m },
})

export const KINDS: KindInfo[] = [
  { id: 'male', name: '男', sex: 'm', weight: 52, skins: TONES.map(([n, s, d]) => ({ name: n, skin: human(s, d, 'm') })) },
  { id: 'female', name: '女', sex: 'f', weight: 34, skins: TONES.map(([n, s, d]) => ({ name: n, skin: human(s, d, 'f') })) },
  {
    id: 'zombie',
    name: '僵尸',
    sex: 'm',
    weight: 5,
    skins: [
      palette('绿', '#7da269', '#5e7253', '#9bd17f', '#a01818', '#000000'),
      palette('蓝灰', '#7d9ba6', '#5a7380', '#b3d1db', '#a01818', '#000000'),
      palette('腐黄', '#a6a35a', '#7c7a3e', '#d1cf8a', '#a01818', '#000000'),
    ],
  },
  {
    id: 'ape',
    name: '猿',
    sex: 'm',
    weight: 3,
    skins: [
      palette('棕', '#856f56', '#61503d', '#61503d', '#000000', '#000000'),
      palette('金', '#c4914f', '#946a35', '#946a35', '#000000', '#000000'),
      palette('灰', '#7a7a7a', '#555555', '#555555', '#000000', '#000000'),
      palette('黑', '#4a403a', '#2e2620', '#2e2620', '#000000', '#000000'),
    ],
  },
  {
    id: 'alien',
    name: '外星人',
    sex: 'm',
    weight: 1.5,
    skins: [
      palette('青', '#c8fbfb', '#75bdbd', '#9be0e0', '#000000', '#75bdbd'),
      palette('紫', '#d6c8ff', '#8a72d1', '#b8a6f0', '#000000', '#8a72d1'),
      palette('绿', '#b6f5a8', '#6fb860', '#94dc86', '#000000', '#6fb860'),
    ],
  },
  {
    id: 'robot',
    name: '机器人',
    sex: 'm',
    weight: 2,
    skins: [
      palette('银', '#a7b2bd', '#6d7a87', '#22e3ff', '#22e3ff', '#3a4450'),
      palette('金', '#d9b65a', '#9c7e33', '#ff3355', '#ff3355', '#5c4a1e'),
      palette('黑', '#4a4f57', '#2c3036', '#3dff7a', '#3dff7a', '#16191d'),
    ],
  },
  {
    id: 'skeleton',
    name: '骷髅',
    sex: 'm',
    weight: 1.5,
    skins: [
      palette('骨白', '#ece6d2', '#b5ae96', '#000000', '#000000', '#000000'),
      palette('古黄', '#d9c9a0', '#a8976c', '#000000', '#000000', '#000000'),
    ],
  },
  {
    id: 'demon',
    name: '恶魔',
    sex: 'm',
    weight: 1,
    skins: [
      palette('红', '#c0392b', '#8e2a1f', '#ffd23a', '#000000', '#3a0a05'),
      palette('紫', '#7b3fa0', '#542a6e', '#ffd23a', '#000000', '#2a0f3a'),
      palette('黑', '#3a2a2a', '#201515', '#ff3355', '#000000', '#120808'),
    ],
  },
]
export const KIND: Record<Kind, KindInfo> = Object.fromEntries(KINDS.map((k) => [k.id, k])) as Record<Kind, KindInfo>

const pad = (n: number, body: string) => '.'.repeat(n) + body
const S = (n: number) => 's'.repeat(n)

function rows(spec: Record<number, string>): string[] {
  return Array.from({ length: SIZE }, (_, y) => spec[y] ?? '')
}

const MALE_ROWS = rows({
  5: pad(8, 'oooooooo'),
  6: pad(7, `o${S(8)}o`),
  7: pad(6, `o${S(10)}o`),
  8: pad(6, `o${S(10)}o`),
  9: pad(6, `o${S(10)}o`),
  10: pad(6, `o${S(10)}o`),
  11: pad(6, 'ossddsssddso'),
  12: pad(5, 'ossswpssswpso'),
  13: pad(5, `od${S(10)}o`),
  14: pad(5, 'ossssssdsssso'),
  15: pad(6, 'osssssdsssso'),
  16: pad(6, `o${S(10)}o`),
  17: pad(6, 'ossssmmmssso'),
  18: pad(6, `o${S(10)}o`),
  19: pad(6, `o${S(9)}o`),
  20: pad(6, `o${S(8)}o`),
  21: pad(6, `o${S(5)}oooo`),
  22: pad(6, `o${S(5)}o`),
  23: pad(6, `o${S(5)}o`),
})

const FEMALE_ROWS = rows({
  6: pad(9, 'oooooo'),
  7: pad(8, `o${S(6)}o`),
  8: pad(7, `o${S(8)}o`),
  9: pad(7, `o${S(8)}o`),
  10: pad(7, `o${S(8)}o`),
  11: pad(7, 'osddssddso'),
  12: pad(6, 'osswpsswpso'),
  13: pad(6, `od${S(8)}o`),
  14: pad(6, 'osssssdssso'),
  15: pad(7, 'ossssdssso'),
  16: pad(7, `o${S(8)}o`),
  17: pad(7, 'osssmmmsso'),
  18: pad(7, `o${S(8)}o`),
  19: pad(7, `o${S(7)}o`),
  20: pad(7, `o${S(6)}o`),
  21: pad(7, `o${S(4)}ooo`),
  22: pad(7, `o${S(4)}o`),
  23: pad(7, `o${S(4)}o`),
})

function anchors(sprite: string[], o: Omit<Anchors, 'face'>): Anchors {
  const face = (x: number, y: number) => x >= o.L && 'sdwpm'.includes(sprite[y]?.[x] ?? '.')
  return { ...o, face }
}

export const BASE: Record<Sex, { rows: string[]; anchors: Anchors }> = {
  m: {
    rows: MALE_ROWS,
    anchors: anchors(MALE_ROWS, {
      top: 6, L: 7, R: 16, eyeY: 12, eyeL: 9, eyeR: 14, noseX: 12,
      mouthY: 17, mouthL: 11, mouthR: 13, earX: 6, chinY: 20, neckL: 7, neckR: 11,
    }),
  },
  f: {
    rows: FEMALE_ROWS,
    anchors: anchors(FEMALE_ROWS, {
      top: 7, L: 8, R: 15, eyeY: 12, eyeL: 9, eyeR: 13, noseX: 12,
      mouthY: 17, mouthL: 11, mouthR: 13, earX: 7, chinY: 20, neckL: 8, neckR: 11,
    }),
  },
}

export const defaultOptions = (): GenOptions => ({
  theme: 'none',
  kind: 'random',
  skin: 'random',
  slots: { head: 'random', eyes: 'random', beard: 'random', mouth: 'random', outfit: 'random', acc: 'random' },
})

export function traitsFor(slot: Slot, sex?: Sex, theme?: string): Trait[] {
  const th = themeOf(theme)
  return TRAITS.filter((t) => t.slot === slot && (!sex || !t.sex || t.sex === sex) && inTheme(t, th))
}

function kindPool(th: Theme, sex?: Sex) {
  const base = KINDS.filter((k) => !sex || k.sex === sex)
  const themed = base.filter((k) => th.kinds[k.id]).map((k) => ({ ...k, weight: th.kinds[k.id] }))
  return themed.length ? themed : base
}

/** 由种子和约束确定性地生成头像, 每个槽位固定消耗随机数, 锁定某个槽位不会扰动其它槽位 */
export function generate(seed: string, opt: GenOptions): Punk {
  const rng = makeRng(seed)
  const th = themeOf(opt.theme)
  const forced = SLOTS.map((s) => TRAIT_BY_ID[opt.slots[s]]).filter(Boolean)
  const needSex = forced.find((t) => t.sex)?.sex
  const rolledKind = weighted(rng, kindPool(th, needSex))!.id
  const kind = opt.kind === 'random' ? rolledKind : opt.kind
  const info = KIND[kind]
  const skinRoll = Math.floor(rng() * info.skins.length)
  const skinIndex = opt.skin === 'random' || opt.skin >= info.skins.length ? skinRoll : opt.skin

  const picks: Picked[] = []
  const add = (trait: Trait | undefined, roll: number, odd: number[]) => {
    if (!trait || (trait.sex && trait.sex !== info.sex)) return
    const colorable = trait.swatches.length >= 4
    const sw = colorable && th.colors.length && odd[0] < 0.5
      ? th.colors[Math.floor(odd[1] * th.colors.length)]
      : colorable && !th.colors.length && odd[0] < 0.1
      ? swatch('异色', hex(fromHsl(odd[1] * 360, 0.45 + odd[2] * 0.45, 0.3 + odd[3] * 0.35)))
      : trait.swatches[Math.floor(roll * trait.swatches.length)]
    picks.push({ trait, swatch: sw })
  }
  for (const slot of SLOTS) {
    const pool = traitsFor(slot, info.sex, th.id).map((trait) => ({ trait, weight: themedWeight(trait, th) }))
    const chance = rng()
    const first = weighted(rng, pool)?.trait
    const second = weighted(
      rng,
      pool.filter((p) => p.trait !== first),
    )?.trait
    const rolls = [rng(), rng()]
    const odd = [rng(), rng(), rng(), rng()]
    const choice = opt.slots[slot]
    if (choice === 'none') continue
    if (choice !== 'random') {
      add(TRAIT_BY_ID[choice], rolls[0], odd)
      continue
    }
    if (slot === 'acc') {
      const n = chance < 0.45 ? 0 : chance < 0.8 ? 1 : 2
      ;[first, second].slice(0, n).forEach((t, i) => add(t, rolls[i], odd))
    } else if (chance < (th.chance[slot] ?? SLOT_CHANCE[slot])) add(first, rolls[0], odd)
  }
  return { seed, kind, skinIndex, theme: th.id, face: rollFace(rng), picks }
}

export function skinOf(p: Punk): SkinPalette {
  return KIND[p.kind].skins[p.skinIndex].skin
}

/** 把头像栅格化为 24×24 像素 */
export function drawPunk(p: Punk): Grid {
  const info = KIND[p.kind]
  const skin = skinOf(p)
  const base = BASE[info.sex]
  const a = base.anchors
  const g = new Grid()
  g.sprite(0, 0, base.rows, { o: '#000000', s: skin.s, d: skin.d, w: skin.w, p: skin.p, m: skin.m })
  if (['male', 'female', 'zombie', 'demon'].includes(p.kind)) shapeFace(g, a, skin, p.face)
  if (p.kind === 'ape') decorateApe(g, a, skin)
  if (p.kind === 'alien') decorateAlien(g, a, skin)
  if (p.kind === 'robot') decorateRobot(g, a, skin)
  if (p.kind === 'skeleton') decorateSkeleton(g, a, skin)
  if (p.kind === 'demon') decorateDemon(g, a)
  const rng = makeRng(`${p.seed}:draw`)
  for (const pk of [...p.picks].sort((x, y) => x.trait.z - y.trait.z))
    pk.trait.draw({ g, a, rng, c: pk.swatch, skin, sex: info.sex })
  return g
}

export function traitLabel(pk: Picked): string {
  return pk.trait.swatches.length > 1 ? `${pk.trait.name} · ${pk.swatch.name}` : pk.trait.name
}
