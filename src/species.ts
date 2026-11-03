import { shade } from './color'
import type { Sex, SkinPalette } from './traits'

export type Species = 'human' | 'zombie' | 'ape' | 'alien' | 'robot' | 'skeleton' | 'demon'

/** 物种, 决定肤色调色板与面部改造 */
export interface SpeciesInfo {
  id: Species
  name: string
  skins: { name: string; skin: SkinPalette }[]
}

export const SEXES: { id: Sex; name: string }[] = [
  { id: 'male', name: '男' },
  { id: 'female', name: '女' },
]
export const SEX_NAMES: Record<Sex, string> = { male: '男', female: '女' }

const LIPS = '#711010'

const tone = (name: string, s: string, d: string) => ({
  name,
  skin: { s, d, w: shade(s, 0.72), p: '#000000', m: shade(s, 0.45) },
})

const palette = (name: string, s: string, d: string, w: string, p: string, m: string) => ({
  name,
  skin: { s, d, w, p, m },
})

export const SPECIES: SpeciesInfo[] = [
  {
    id: 'human',
    name: '人类',
    skins: [
      tone('白皙', '#ead9d9', '#c9b2b2'),
      tone('浅', '#f1c8a5', '#c99a74'),
      tone('小麦', '#dbb180', '#a77c47'),
      tone('中', '#ae8b61', '#86581e'),
      tone('棕', '#8d5524', '#64390f'),
      tone('深', '#713f1d', '#562600'),
    ],
  },
  {
    id: 'zombie',
    name: '僵尸',
    skins: [
      palette('绿', '#7da269', '#5e7253', '#9bd17f', '#a01818', '#000000'),
      palette('蓝灰', '#7d9ba6', '#5a7380', '#b3d1db', '#a01818', '#000000'),
      palette('腐黄', '#a6a35a', '#7c7a3e', '#d1cf8a', '#a01818', '#000000'),
    ],
  },
  {
    id: 'ape',
    name: '猿',
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
    skins: [
      palette('青', '#c8fbfb', '#75bdbd', '#9be0e0', '#000000', '#75bdbd'),
      palette('紫', '#d6c8ff', '#8a72d1', '#b8a6f0', '#000000', '#8a72d1'),
      palette('绿', '#b6f5a8', '#6fb860', '#94dc86', '#000000', '#6fb860'),
    ],
  },
  {
    id: 'robot',
    name: '机器人',
    skins: [
      palette('银', '#a7b2bd', '#6d7a87', '#22e3ff', '#22e3ff', '#3a4450'),
      palette('金', '#d9b65a', '#9c7e33', '#ff3355', '#ff3355', '#5c4a1e'),
      palette('黑', '#4a4f57', '#2c3036', '#3dff7a', '#3dff7a', '#16191d'),
    ],
  },
  {
    id: 'skeleton',
    name: '骷髅',
    skins: [
      palette('骨白', '#ece6d2', '#b5ae96', '#000000', '#000000', '#000000'),
      palette('古黄', '#d9c9a0', '#a8976c', '#000000', '#000000', '#000000'),
    ],
  },
  {
    id: 'demon',
    name: '恶魔',
    skins: [
      palette('红', '#c0392b', '#8e2a1f', '#ffd23a', '#000000', '#3a0a05'),
      palette('紫', '#7b3fa0', '#542a6e', '#ffd23a', '#000000', '#2a0f3a'),
      palette('黑', '#3a2a2a', '#201515', '#ff3355', '#000000', '#120808'),
    ],
  },
]
export const SPECIES_BY_ID = Object.fromEntries(SPECIES.map((s) => [s.id, s])) as Record<Species, SpeciesInfo>

/** 取物种某个肤色在指定性别下的调色板, 人类女性默认带唇色 */
export function skinFor(species: Species, index: number, sex: Sex): SkinPalette {
  const skin = SPECIES_BY_ID[species].skins[index].skin
  return species === 'human' && sex === 'female' ? { ...skin, m: LIPS } : skin
}
