import { type Sex, type Slot, type Swatch, swatch, type Trait } from './traits'

/** 世界, 与物种和性别正交, 决定物种与性别分布, 部件池, 部件权重, 配色与默认风格 */
export interface World {
  id: string
  name: string
  style: string
  species: Record<string, number>
  sex: Record<Sex, number>
  boost: Record<string, number>
  ban: Set<string>
  chance: Partial<Record<Slot, number>>
  colors: Swatch[]
}

/** 世界专属部件的权重倍数, 让世界辨识度足够高 */
const SIGNATURE = 3

const world = (o: Omit<World, 'ban'> & { ban?: string[] }): World => ({ ...o, ban: new Set(o.ban ?? []) })

const CLASSIC = world({
  id: 'classic',
  name: '经典',
  style: 'classic',
  species: { human: 91, zombie: 5, ape: 3, robot: 2, alien: 1.5, skeleton: 1.5, demon: 1 },
  sex: { male: 60, female: 40 },
  boost: {},
  chance: {},
  colors: [],
})

const BLADE_RUNNER = world({
  id: 'bladerunner',
  name: '银翼杀手',
  style: 'rain',
  species: { human: 92, robot: 8 },
  sex: { male: 52, female: 48 },
  boost: {
    cigarette: 4,
    shades: 2,
    'small-shades': 2,
    'side-part': 3,
    vampire: 3,
    'middle-part': 2,
    shaved: 2,
    bald: 2,
    leather: 3,
    suit: 3,
    turtleneck: 3,
    'cyber-visor': 3,
    scar: 2,
    'shadow-beard': 2,
  },
  ban: [
    'cowboy', 'viking', 'chef', 'mortarboard', 'party', 'pirate', 'clown-hair', 'clown-eyes', 'clown-nose',
    'halo', 'crown', 'tiara', 'bubblegum', 'straw', 'rose', 'lollipop', 'hawaiian', 'bucket', 'cat-ears',
    'horns', '3d', 'pigtails', 'police',
  ],
  chance: { outfit: 0.75, mouth: 0.5, eyes: 0.5 },
  colors: [
    swatch('霓虹粉', '#ff2e88'),
    swatch('青', '#00e5ff'),
    swatch('琥珀', '#ffb347'),
    swatch('深青', '#0d3b4c'),
    swatch('烟灰', '#3b3f4a'),
    swatch('血橙', '#ff5a1f'),
  ],
})

const WESTWORLD = world({
  id: 'westworld',
  name: '西部世界',
  style: 'wanted',
  species: { human: 97, skeleton: 3 },
  sex: { male: 57, female: 43 },
  boost: {
    cowboy: 6,
    fedora: 2,
    bandana: 2,
    mustache: 3,
    handlebars: 4,
    muttonchops: 4,
    'full-beard': 2,
    chinstrap: 2,
    'shadow-beard': 3,
    cigar: 3,
    pipe: 2,
    straw: 4,
    monocle: 2,
    'round-glasses': 2,
    scarf: 2,
    bowtie: 3,
    suit: 2,
    patch: 2,
    scar: 3,
  },
  ban: [
    'cap', 'vr', '3d', 'cyber-visor', 'ski-goggles', 'laser', 'heart-glasses', 'headphones', 'vape',
    'medical-mask', 'gas-mask', 'hoodie', 'party', 'tee', 'leather', 'hawaiian', 'mortarboard', 'chef',
    'viking', 'halo', 'cat-ears', 'horns', 'bubblegum', 'lollipop', 'grill', 'war-paint', 'mohawk', 'spike',
    'knitted', 'dorag', 'sleep-mask', 'clown-hair', 'clown-eyes', 'clown-nose', 'big-shades', 'small-shades',
    'shades', 'dreads', 'crazy', 'police', 'nose-ring', 'brow-piercing', 'star-tattoo', 'choker',
    'turtleneck', 'eyeliner', 'pirate', 'crown', 'tiara', 'beret',
  ],
  chance: { head: 0.95, outfit: 0.8, beard: 0.55 },
  colors: [
    swatch('皮革', '#8b5a2b'),
    swatch('沙色', '#c2a878'),
    swatch('赭石', '#a0522d'),
    swatch('鞍棕', '#5c4033'),
    swatch('褪红', '#9e3b2f'),
    swatch('靛蓝', '#2e3a59'),
  ],
})

const BREAKING_BAD = world({
  id: 'breakingbad',
  name: '绝命毒师',
  style: 'desert',
  species: { human: 98, skeleton: 2 },
  sex: { male: 70, female: 30 },
  boost: {
    bald: 6,
    shaved: 3,
    beanie: 4,
    hoodie: 4,
    goat: 3,
    mustache: 3,
    'normal-beard': 2,
    'shadow-beard': 3,
    aviators: 3,
    shades: 2,
    grill: 3,
    cigarette: 2,
    suit: 3,
    tee: 2,
    chain: 3,
    earring: 2,
  },
  ban: [
    'viking', 'chef', 'mortarboard', 'party', 'pirate', 'crown', 'tiara', 'halo', 'horns', 'cat-ears',
    'clown-hair', 'clown-eyes', 'clown-nose', 'laser', 'cyber-visor', 'vr', '3d', 'heart-glasses',
    'sleep-mask', 'monocle', 'tophat', 'police', 'war-paint', 'star-tattoo', 'gas-mask', 'medical-mask',
  ],
  chance: { head: 0.9, beard: 0.55, outfit: 0.75, eyes: 0.5 },
  colors: [
    swatch('防护黄', '#f2c230'),
    swatch('结晶蓝', '#4fc3f7'),
    swatch('沙漠', '#d9a066'),
    swatch('房车米', '#e8dcc0'),
    swatch('元素绿', '#3f6b3a'),
    swatch('淡紫', '#b39ddb'),
  ],
})

export const WORLDS: World[] = [CLASSIC, BLADE_RUNNER, WESTWORLD, BREAKING_BAD]
export const WORLD_BY_ID: Record<string, World> = Object.fromEntries(WORLDS.map((w) => [w.id, w]))

export function worldOf(id: string | undefined): World {
  return WORLD_BY_ID[id ?? CLASSIC.id] ?? CLASSIC
}

/** 部件是否属于该世界的部件池, 专属部件只在对应世界出现 */
export function inWorld(t: Trait, w: World): boolean {
  return t.world ? t.world === w.id : !w.ban.has(t.id)
}

export function worldWeight(t: Trait, w: World): number {
  return t.weight * (t.world ? SIGNATURE : (w.boost[t.id] ?? 1))
}
