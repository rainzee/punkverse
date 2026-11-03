import { classicAcc } from './acc'
import { classicEyes } from './eyes'
import { classicBeard, classicMouth } from './face'
import { classicHead } from './head'
import type { Trait } from './kit'
import { moreAcc } from './more-acc'
import { moreEyes } from './more-eyes'
import { moreBeard, moreMouth } from './more-face'
import { moreHead } from './more-head'
import { outfit } from './outfit'
import { bladeRunner } from './theme-bladerunner'
import { breakingBad } from './theme-breakingbad'
import { westworld } from './theme-westworld'

export * from './kit'

export const TRAITS: Trait[] = [
  ...classicHead,
  ...moreHead,
  ...classicEyes,
  ...moreEyes,
  ...classicBeard,
  ...moreBeard,
  ...classicMouth,
  ...moreMouth,
  ...outfit,
  ...classicAcc,
  ...moreAcc,
  ...bladeRunner,
  ...westworld,
  ...breakingBad,
]
export const TRAIT_BY_ID: Record<string, Trait> = Object.fromEntries(TRAITS.map((x) => [x.id, x]))
