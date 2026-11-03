import { type Slot, type Swatch, swatch, type Trait } from './traits'

/** IP 主题, 与种族正交, 调整种族分布, 部件池, 权重, 配色与默认风格 */
export interface Theme {
  id: string
  name: string
  style: string
  kinds: Record<string, number>
  boost: Record<string, number>
  ban: Set<string>
  chance: Partial<Record<Slot, number>>
  colors: Swatch[]
}

/** 主题专属部件的权重倍数, 让主题辨识度足够高 */
const SIGNATURE = 3

const theme = (o: Omit<Theme, 'ban'> & { ban?: string[] }): Theme => ({ ...o, ban: new Set(o.ban ?? []) })

const NONE = theme({ id: 'none', name: '经典', style: 'classic', kinds: {}, boost: {}, chance: {}, colors: [] })

const BLADE_RUNNER = theme({
  id: 'bladerunner',
  name: '银翼杀手',
  style: 'rain',
  kinds: { male: 48, female: 44, robot: 8 },
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

const WESTWORLD = theme({
  id: 'westworld',
  name: '西部世界',
  style: 'wanted',
  kinds: { male: 55, female: 42, skeleton: 3 },
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

export const THEMES: Theme[] = [NONE, BLADE_RUNNER, WESTWORLD]
export const THEME_BY_ID: Record<string, Theme> = Object.fromEntries(THEMES.map((t) => [t.id, t]))

export function themeOf(id: string | undefined): Theme {
  return THEME_BY_ID[id ?? 'none'] ?? NONE
}

/** 部件是否属于主题部件池, 专属部件只在对应主题出现 */
export function inTheme(t: Trait, th: Theme): boolean {
  return t.theme ? t.theme === th.id : !th.ban.has(t.id)
}

export function themedWeight(t: Trait, th: Theme): number {
  return t.weight * (t.theme ? SIGNATURE : (th.boost[t.id] ?? 1))
}
