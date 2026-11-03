import { fromHsl, hex } from './color'
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
import { SEXES, SPECIES, SPECIES_BY_ID, type Species, skinFor } from './species'
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
import { inWorld, worldOf, worldWeight } from './worlds'

/** 已选中的部件及其配色 */
export interface Picked {
  trait: Trait
  swatch: Swatch
}

/** 一个生成好的头像, 由世界, 性别, 物种三个维度加上部件构成 */
export interface Punk {
  seed: string
  world: string
  sex: Sex
  species: Species
  skinIndex: number
  face: FaceShape
  picks: Picked[]
}

/** 生成约束, 部件取值为 random none 或具体部件 id */
export interface GenOptions {
  world: string
  sex: Sex | 'random'
  species: Species | 'random'
  skin: number | 'random'
  slots: Record<Slot, string>
}

export const SLOTS: Slot[] = ['head', 'eyes', 'beard', 'mouth', 'outfit', 'acc']
export const SLOT_NAMES: Record<Slot, string> = { head: '头部', eyes: '眼部', beard: '胡须', mouth: '嘴部', outfit: '衣着', acc: '配饰' }
const SLOT_CHANCE: Record<Slot, number> = { head: 0.9, eyes: 0.42, beard: 0.45, mouth: 0.4, outfit: 0.4, acc: 0 }

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
  male: {
    rows: MALE_ROWS,
    anchors: anchors(MALE_ROWS, {
      top: 6, L: 7, R: 16, eyeY: 12, eyeL: 9, eyeR: 14, noseX: 12,
      mouthY: 17, mouthL: 11, mouthR: 13, earX: 6, chinY: 20, neckL: 7, neckR: 11,
    }),
  },
  female: {
    rows: FEMALE_ROWS,
    anchors: anchors(FEMALE_ROWS, {
      top: 7, L: 8, R: 15, eyeY: 12, eyeL: 9, eyeR: 13, noseX: 12,
      mouthY: 17, mouthL: 11, mouthR: 13, earX: 7, chinY: 20, neckL: 8, neckR: 11,
    }),
  },
}

export const defaultOptions = (): GenOptions => ({
  world: 'classic',
  sex: 'random',
  species: 'random',
  skin: 'random',
  slots: { head: 'random', eyes: 'random', beard: 'random', mouth: 'random', outfit: 'random', acc: 'random' },
})

export function traitsFor(slot: Slot, sex?: Sex, world?: string): Trait[] {
  const w = worldOf(world)
  return TRAITS.filter((t) => t.slot === slot && (!sex || !t.sex || t.sex === sex) && inWorld(t, w))
}

/** 由种子和约束确定性地生成头像, 每个部位固定消耗随机数, 锁定某个部位不会扰动其它部位 */
export function generate(seed: string, opt: GenOptions): Punk {
  const rng = makeRng(seed)
  const w = worldOf(opt.world)
  const forced = SLOTS.map((s) => TRAIT_BY_ID[opt.slots[s]]).filter(Boolean)
  const needSex = forced.find((t) => t.sex)?.sex

  const rolledSex = weighted(
    rng,
    SEXES.filter((s) => !needSex || s.id === needSex).map((s) => ({ id: s.id, weight: w.sex[s.id] })),
  )!.id
  const rolledSpecies = weighted(
    rng,
    SPECIES.filter((s) => w.species[s.id]).map((s) => ({ id: s.id, weight: w.species[s.id] })),
  )!.id
  const sex = opt.sex === 'random' ? rolledSex : opt.sex
  const species = opt.species === 'random' ? rolledSpecies : opt.species
  const skins = SPECIES_BY_ID[species].skins
  const skinRoll = Math.floor(rng() * skins.length)
  const skinIndex = opt.skin === 'random' || opt.skin >= skins.length ? skinRoll : opt.skin

  const picks: Picked[] = []
  const add = (trait: Trait | undefined, roll: number, odd: number[]) => {
    if (!trait || (trait.sex && trait.sex !== sex)) return
    const colorable = trait.swatches.length >= 4
    const sw =
      colorable && w.colors.length && odd[0] < 0.5
        ? w.colors[Math.floor(odd[1] * w.colors.length)]
        : colorable && !w.colors.length && odd[0] < 0.1
          ? swatch('异色', hex(fromHsl(odd[1] * 360, 0.45 + odd[2] * 0.45, 0.3 + odd[3] * 0.35)))
          : trait.swatches[Math.floor(roll * trait.swatches.length)]
    picks.push({ trait, swatch: sw })
  }
  for (const slot of SLOTS) {
    const pool = traitsFor(slot, sex, w.id).map((trait) => ({ trait, weight: worldWeight(trait, w) }))
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
    } else if (chance < (w.chance[slot] ?? SLOT_CHANCE[slot])) add(first, rolls[0], odd)
  }
  return { seed, world: w.id, sex, species, skinIndex, face: rollFace(rng), picks }
}

export function skinOf(p: Punk): SkinPalette {
  return skinFor(p.species, p.skinIndex, p.sex)
}

const SHAPED: Species[] = ['human', 'zombie', 'demon']

/** 把头像栅格化为 24×24 像素 */
export function drawPunk(p: Punk): Grid {
  const skin = skinOf(p)
  const base = BASE[p.sex]
  const a = base.anchors
  const g = new Grid()
  g.sprite(0, 0, base.rows, { o: '#000000', s: skin.s, d: skin.d, w: skin.w, p: skin.p, m: skin.m })
  if (SHAPED.includes(p.species)) shapeFace(g, a, skin, p.face)
  if (p.species === 'ape') decorateApe(g, a, skin)
  if (p.species === 'alien') decorateAlien(g, a, skin)
  if (p.species === 'robot') decorateRobot(g, a, skin)
  if (p.species === 'skeleton') decorateSkeleton(g, a, skin)
  if (p.species === 'demon') decorateDemon(g, a)
  const rng = makeRng(`${p.seed}:draw`)
  for (const pk of [...p.picks].sort((x, y) => x.trait.z - y.trait.z))
    pk.trait.draw({ g, a, rng, c: pk.swatch, skin, sex: p.sex })
  return g
}

export function traitLabel(pk: Picked): string {
  return pk.trait.swatches.length > 1 ? `${pk.trait.name} · ${pk.swatch.name}` : pk.trait.name
}

