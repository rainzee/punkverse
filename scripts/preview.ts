// 在终端用真彩色预览头像, 用法: bun scripts/preview.ts [seed...] [--head=cap] [--kind=female]
import { parse } from '../src/color'
import { SIZE } from '../src/grid'
import { defaultOptions, drawPunk, generate, traitLabel } from '../src/punk'
import type { Slot } from '../src/traits'

const opt = defaultOptions()
const seeds: string[] = []
for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^--(\w+)=(.+)$/)
  if (!m) seeds.push(arg)
  else if (m[1] === 'kind') opt.kind = m[2] as typeof opt.kind
  else opt.slots[m[1] as Slot] = m[2]
}
if (!seeds.length) seeds.push(Math.random().toString(36).slice(2, 8))

for (const seed of seeds) {
  const punk = generate(seed, opt)
  const g = drawPunk(punk)
  console.log(`\n${seed} · ${punk.kind} · ${punk.picks.map(traitLabel).join(', ') || '无属性'}`)
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
