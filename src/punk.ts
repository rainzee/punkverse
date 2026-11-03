import { shade } from './color'
import { Grid, SIZE } from './grid'
import { makeRng, weighted } from './rng'
import { type Anchors, type Sex, type SkinPalette, type Slot, type Swatch, type Trait, TRAITS, TRAIT_BY_ID } from './traits'

export type Kind = 'male' | 'female' | 'zombie' | 'ape' | 'alien'

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
  picks: Picked[]
}

/** 生成约束, 部件取值为 random none 或具体部件 id */
export interface GenOptions {
  kind: Kind | 'random'
  skin: number | 'random'
  slots: Record<Slot, string>
}

export const SLOTS: Slot[] = ['head', 'eyes', 'beard', 'mouth', 'acc']
export const SLOT_NAMES: Record<Slot, string> = { head: '头部', eyes: '眼部', beard: '胡须', mouth: '嘴部', acc: '配饰' }
const SLOT_CHANCE: Record<Slot, number> = { head: 0.9, eyes: 0.42, beard: 0.45, mouth: 0.4, acc: 0 }

const human = (s: string, d: string, sex: Sex): SkinPalette => ({
  s,
  d,
  w: shade(s, 0.72),
  p: '#000000',
  m: sex === 'f' ? '#711010' : shade(s, 0.45),
})
const TONES: [string, string, string][] = [
  ['白皙', '#ead9d9', '#c9b2b2'],
  ['浅', '#dbb180', '#a77c47'],
  ['中', '#ae8b61', '#86581e'],
  ['深', '#713f1d', '#562600'],
]

export const KINDS: KindInfo[] = [
  { id: 'male', name: '男', sex: 'm', weight: 55, skins: TONES.map(([n, s, d]) => ({ name: n, skin: human(s, d, 'm') })) },
  { id: 'female', name: '女', sex: 'f', weight: 36, skins: TONES.map(([n, s, d]) => ({ name: n, skin: human(s, d, 'f') })) },
  {
    id: 'zombie',
    name: '僵尸',
    sex: 'm',
    weight: 5,
    skins: [{ name: '僵尸', skin: { s: '#7da269', d: '#5e7253', w: '#9bd17f', p: '#a01818', m: '#000000' } }],
  },
  {
    id: 'ape',
    name: '猿',
    sex: 'm',
    weight: 3,
    skins: [{ name: '猿', skin: { s: '#856f56', d: '#61503d', w: '#61503d', p: '#000000', m: '#000000' } }],
  },
  {
    id: 'alien',
    name: '外星人',
    sex: 'm',
    weight: 1,
    skins: [{ name: '外星人', skin: { s: '#c8fbfb', d: '#75bdbd', w: '#9be0e0', p: '#000000', m: '#75bdbd' } }],
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
      mouthY: 17, mouthL: 11, mouthR: 13, earX: 6, chinY: 20,
    }),
  },
  f: {
    rows: FEMALE_ROWS,
    anchors: anchors(FEMALE_ROWS, {
      top: 7, L: 8, R: 15, eyeY: 12, eyeL: 9, eyeR: 13, noseX: 12,
      mouthY: 17, mouthL: 11, mouthR: 13, earX: 7, chinY: 20,
    }),
  },
}

export const defaultOptions = (): GenOptions => ({
  kind: 'random',
  skin: 'random',
  slots: { head: 'random', eyes: 'random', beard: 'random', mouth: 'random', acc: 'random' },
})

export function traitsFor(slot: Slot, sex?: Sex): Trait[] {
  return TRAITS.filter((t) => t.slot === slot && (!sex || !t.sex || t.sex === sex))
}

/** 由种子和约束确定性地生成头像, 每个槽位固定消耗随机数, 锁定某个槽位不会扰动其它槽位 */
export function generate(seed: string, opt: GenOptions): Punk {
  const rng = makeRng(seed)
  const forced = SLOTS.map((s) => TRAIT_BY_ID[opt.slots[s]]).filter(Boolean)
  const needSex = forced.find((t) => t.sex)?.sex
  const kindPool = KINDS.filter((k) => !needSex || k.sex === needSex)
  const rolledKind = weighted(rng, kindPool)!.id
  const kind = opt.kind === 'random' ? rolledKind : opt.kind
  const info = KIND[kind]
  const skinRoll = Math.floor(rng() * info.skins.length)
  const skinIndex = opt.skin === 'random' || opt.skin >= info.skins.length ? skinRoll : opt.skin

  const picks: Picked[] = []
  const add = (trait: Trait | undefined, roll: number) => {
    if (!trait || (trait.sex && trait.sex !== info.sex)) return
    picks.push({ trait, swatch: trait.swatches[Math.floor(roll * trait.swatches.length)] })
  }
  for (const slot of SLOTS) {
    const pool = traitsFor(slot, info.sex)
    const chance = rng()
    const first = weighted(rng, pool)
    const second = weighted(
      rng,
      pool.filter((t) => t !== first),
    )
    const rolls = [rng(), rng()]
    const choice = opt.slots[slot]
    if (choice === 'none') continue
    if (choice !== 'random') {
      add(TRAIT_BY_ID[choice], rolls[0])
      continue
    }
    if (slot === 'acc') {
      const n = chance < 0.5 ? 0 : chance < 0.85 ? 1 : 2
      ;[first, second].slice(0, n).forEach((t, i) => add(t, rolls[i]))
    } else if (chance < SLOT_CHANCE[slot]) add(first, rolls[0])
  }
  return { seed, kind, skinIndex, picks }
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
  if (p.kind === 'ape') {
    const muzzle = '#a68a6b'
    for (let y = a.eyeY + 2; y <= a.chinY; y++)
      for (let x = a.mouthL - 2; x <= a.R; x++) if (a.face(x, y)) g.set(x, y, muzzle)
    g.hline(a.eyeY - 1, a.L, a.R, skin.d)
    g.set(a.noseX, a.eyeY + 2, '#000000')
    g.set(a.noseX + 1, a.eyeY + 2, '#000000')
    g.hline(a.mouthY, a.mouthL, a.mouthR, skin.m)
  }
  if (p.kind === 'alien') {
    g.hline(a.eyeY - 1, a.L, a.R, skin.s)
    g.set(a.eyeL, a.eyeY, '#000000')
    g.set(a.eyeR, a.eyeY, '#000000')
  }
  const rng = makeRng(`${p.seed}:draw`)
  for (const pk of [...p.picks].sort((x, y) => x.trait.z - y.trait.z))
    pk.trait.draw({ g, a, rng, c: pk.swatch, skin, sex: info.sex })
  return g
}

export function traitLabel(pk: Picked): string {
  return pk.trait.swatches.length > 1 ? `${pk.trait.name} · ${pk.swatch.name}` : pk.trait.name
}
