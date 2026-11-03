// 在终端用真彩色预览头像, 用法: bun scripts/preview.ts [seed...] [--world=westworld] [--sex=female] [--species=robot] [--head=cap]
import { parse } from '../src/color'
import { SIZE } from '../src/grid'
import { defaultOptions, drawPunk, generate, traitLabel } from '../src/punk'
import { SEX_NAMES, type Species, SPECIES_BY_ID } from '../src/species'
import type { Sex, Slot } from '../src/traits'

const opt = defaultOptions()
const seeds: string[] = []
for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^--(\w+)=(.+)$/)
  if (!m) seeds.push(arg)
  else if (m[1] === 'world') opt.world = m[2]
  else if (m[1] === 'sex') opt.sex = m[2] as Sex
  else if (m[1] === 'species') opt.species = m[2] as Species
  else opt.slots[m[1] as Slot] = m[2]
}
if (!seeds.length) seeds.push(Math.random().toString(36).slice(2, 8))

for (const seed of seeds) {
  const punk = generate(seed, opt)
  const g = drawPunk(punk)
  const head = [punk.world, SEX_NAMES[punk.sex], SPECIES_BY_ID[punk.species].name, ...punk.picks.map(traitLabel)]
  console.log(`\n${seed} · ${head.join(' · ')}`)
  for (let y = 0; y < SIZE; y += 2) {
    let line = ''
    for (let x = 0; x < SIZE; x++) {
      const top = parse(g.get(x, y) ?? '#638596')
      const bot = parse(g.get(x, y + 1) ?? '#638596')
      line += `\x1b[38;2;${top.r};${top.g};${top.b}m\x1b[48;2;${bot.r};${bot.g};${bot.b}m▀`
    }
    console.log(`${line}\x1b[0m`)
  }
}
