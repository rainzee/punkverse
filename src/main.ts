import {
  defaultOptions,
  drawPunk,
  type GenOptions,
  generate,
  type Punk,
  SLOT_NAMES,
  SLOTS,
  traitLabel,
  traitsFor,
} from './punk'
import { renderCanvas, renderSvg } from './render'
import { randomSeed } from './rng'
import { SEX_NAMES, SEXES, SPECIES, SPECIES_BY_ID, type Species } from './species'
import { STYLE_BY_ID, STYLES } from './styles'
import { type Sex, type Slot, TRAIT_BY_ID } from './traits'
import { inWorld, WORLD_BY_ID, WORLDS, worldOf } from './worlds'

interface State {
  seed: string
  style: string
  opt: GenOptions
  background: boolean
  size: number
}

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T
const dpr = Math.min(2, window.devicePixelRatio || 1)

const state: State = { seed: randomSeed(), style: 'classic', opt: defaultOptions(), background: true, size: 1024 }
let punk: Punk
let batch: string[] = []

function readHash() {
  const q = new URLSearchParams(location.hash.slice(1))
  if (q.get('s')) state.seed = q.get('s')!
  if (STYLE_BY_ID[q.get('st') ?? '']) state.style = q.get('st')!
  if (WORLD_BY_ID[q.get('w') ?? '']) state.opt.world = q.get('w')!
  const sx = q.get('sx') as Sex | null
  if (sx && SEX_NAMES[sx]) state.opt.sex = sx
  const sp = q.get('sp') as Species | null
  if (sp && SPECIES_BY_ID[sp]) state.opt.species = sp
  if (q.get('sk')) state.opt.skin = Number(q.get('sk'))
  for (const s of SLOTS) if (q.get(s)) state.opt.slots[s] = q.get(s)!
  if (q.get('bg') === '0') state.background = false
}

function writeHash() {
  const q = new URLSearchParams({ s: state.seed, st: state.style })
  if (state.opt.world !== 'classic') q.set('w', state.opt.world)
  if (state.opt.sex !== 'random') q.set('sx', state.opt.sex)
  if (state.opt.species !== 'random') q.set('sp', state.opt.species)
  if (state.opt.skin !== 'random') q.set('sk', String(state.opt.skin))
  for (const s of SLOTS) if (state.opt.slots[s] !== 'random') q.set(s, state.opt.slots[s])
  if (!state.background) q.set('bg', '0')
  history.replaceState(null, '', `#${q}`)
}

const style = () => STYLE_BY_ID[state.style]
const lockedSex = () => (state.opt.sex === 'random' ? undefined : state.opt.sex)

function chip(label: string, on: boolean, onClick: () => void) {
  const b = document.createElement('button')
  b.className = `chip${on ? ' on' : ''}`
  b.append(label)
  b.onclick = onClick
  return b
}

function swatchChip(bg: string, on: boolean, onClick: () => void) {
  const b = document.createElement('button')
  b.className = `swatch${on ? ' on' : ''}`
  b.style.background = bg
  b.onclick = onClick
  return b
}

function renderControls() {
  ;($('seed') as HTMLInputElement).value = state.seed

  $('worlds').replaceChildren(...WORLDS.map((w) => chip(w.name, state.opt.world === w.id, () => setWorld(w.id))))
  $('sexes').replaceChildren(
    chip('随机', state.opt.sex === 'random', () => setSex('random')),
    ...SEXES.map((s) => chip(s.name, state.opt.sex === s.id, () => setSex(s.id))),
  )
  $('species').replaceChildren(
    chip('随机', state.opt.species === 'random', () => setSpecies('random')),
    ...SPECIES.map((s) => chip(s.name, state.opt.species === s.id, () => setSpecies(s.id))),
  )

  const skins = SPECIES_BY_ID[state.opt.species === 'random' ? 'human' : state.opt.species].skins
  const mixed = `conic-gradient(${skins.map((s) => s.skin.s).join(',')})`
  $('skins').hidden = skins.length < 2
  $('skins').replaceChildren(
    swatchChip(mixed, state.opt.skin === 'random', () => update({ skin: 'random' })),
    ...skins.map((s, i) => swatchChip(s.skin.s, state.opt.skin === i, () => update({ skin: i }))),
  )

  const slots = $('slots')
  slots.replaceChildren()
  for (const slot of SLOTS) {
    const pool = traitsFor(slot, lockedSex(), state.opt.world)
    const sel = document.createElement('select')
    const opts: [string, string][] = [
      ['random', SLOT_NAMES[slot]],
      ['none', '无'],
      ...pool.map((t): [string, string] => [t.id, t.name]),
    ]
    for (const [v, text] of opts) sel.add(new Option(text, v, false, state.opt.slots[slot] === v))
    sel.disabled = !pool.length
    sel.classList.toggle('locked', state.opt.slots[slot] !== 'random')
    sel.onchange = () => setSlot(slot, sel.value)
    slots.append(sel)
  }
  ;($('bg') as HTMLInputElement).checked = state.background
}

function setWorld(id: string) {
  const w = worldOf(id)
  state.opt.world = w.id
  state.style = w.style
  for (const s of SLOTS) {
    const t = TRAIT_BY_ID[state.opt.slots[s]]
    if (t && !inWorld(t, w)) state.opt.slots[s] = 'random'
  }
  update({})
}

function setSex(sex: Sex | 'random') {
  state.opt.sex = sex
  for (const s of SLOTS) {
    const t = TRAIT_BY_ID[state.opt.slots[s]]
    if (t?.sex && sex !== 'random' && t.sex !== sex) state.opt.slots[s] = 'random'
  }
  update({})
}

function setSpecies(species: Species | 'random') {
  state.opt.species = species
  state.opt.skin = 'random'
  update({})
}

function setSlot(slot: Slot, value: string) {
  state.opt.slots[slot] = value
  update({})
}

function update(o: { skin?: number | 'random'; seed?: string }) {
  if (o.skin !== undefined) state.opt.skin = o.skin
  if (o.seed !== undefined) state.seed = o.seed
  renderControls()
  renderMain()
  renderStyles()
  renderGallery()
  writeHash()
}

function renderMain() {
  punk = generate(state.seed, state.opt)
  const grid = drawPunk(punk)
  const st = style()
  renderCanvas($('preview'), grid, st, { size: Math.round(480 * dpr), background: state.background, seed: state.seed })
  renderCanvas($('logo'), grid, STYLE_BY_ID.classic, { size: 96, background: true, seed: state.seed })

  const attrs = $('attrs')
  attrs.replaceChildren()
  const li = (text: string, locked: boolean, toggle: () => void) => {
    const el = document.createElement('li')
    el.textContent = text
    el.classList.add('lockable')
    el.classList.toggle('locked', locked)
    el.onclick = toggle
    attrs.append(el)
  }
  const sexLocked = state.opt.sex === punk.sex
  const speciesLocked = state.opt.species === punk.species
  li(SEX_NAMES[punk.sex], sexLocked, () => setSex(sexLocked ? 'random' : punk.sex))
  li(SPECIES_BY_ID[punk.species].name, speciesLocked, () => setSpecies(speciesLocked ? 'random' : punk.species))
  for (const pk of punk.picks) {
    const { slot, id } = pk.trait
    const locked = state.opt.slots[slot] === id
    li(traitLabel(pk), locked, () => setSlot(slot, locked ? 'random' : id))
  }
}

function renderStyles() {
  const grid = drawPunk(punk)
  const box = $('styles')
  if (box.children.length !== STYLES.length) {
    box.replaceChildren(
      ...STYLES.map((s) => {
        const b = document.createElement('button')
        b.className = 'thumb'
        b.dataset.id = s.id
        b.title = s.name
        b.append(document.createElement('canvas'))
        b.onclick = () => setStyle(s.id)
        return b
      }),
    )
  }
  for (const b of box.children as HTMLCollectionOf<HTMLButtonElement>) {
    const s = STYLE_BY_ID[b.dataset.id!]
    b.classList.toggle('on', s.id === state.style)
    renderCanvas(b.querySelector('canvas')!, grid, s, { size: Math.round(120 * dpr), background: true, seed: state.seed })
  }
}

function setStyle(id: string) {
  state.style = id
  renderMain()
  renderStyles()
  renderGallery()
  writeHash()
}

function renderGallery() {
  if (!batch.length) batch = Array.from({ length: 24 }, randomSeed)
  const box = $('gallery')
  box.replaceChildren(
    ...batch.map((seed) => {
      const b = document.createElement('button')
      const c = document.createElement('canvas')
      const p = generate(seed, state.opt)
      renderCanvas(c, drawPunk(p), style(), { size: Math.round(140 * dpr), background: true, seed })
      b.title = `#${seed}`
      b.append(c)
      b.onclick = () => {
        update({ seed })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return b
    }),
  )
}

function download(name: string, blob: Blob) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

const fileBase = () => `punk-${state.seed}-${state.style}`

function bind() {
  $('btn-random').onclick = () => update({ seed: randomSeed() })
  $('seed').oninput = (e) => {
    const v = (e.target as HTMLInputElement).value.trim()
    if (!v) return
    state.seed = v
    renderMain()
    renderStyles()
    writeHash()
  }
  $('btn-unlock').onclick = () => {
    state.opt = defaultOptions()
    update({})
  }
  $('bg').onchange = (e) => {
    state.background = (e.target as HTMLInputElement).checked
    renderMain()
    writeHash()
  }
  $('size').onchange = (e) => (state.size = Number((e.target as HTMLSelectElement).value))
  $('btn-batch').onclick = () => {
    batch = []
    renderGallery()
  }
  $('dl-png').onclick = () => {
    const c = document.createElement('canvas')
    renderCanvas(c, drawPunk(punk), style(), { size: state.size, background: state.background, seed: state.seed })
    c.toBlob((b) => b && download(`${fileBase()}.png`, b), 'image/png')
  }
  $('dl-svg').onclick = () => {
    const svg = renderSvg(drawPunk(punk), style(), { size: state.size, background: state.background, seed: state.seed })
    download(`${fileBase()}.svg`, new Blob([svg], { type: 'image/svg+xml' }))
  }
  $('dl-json').onclick = () => {
    const data = {
      seed: punk.seed,
      style: state.style,
      world: punk.world,
      sex: punk.sex,
      species: punk.species,
      skin: SPECIES_BY_ID[punk.species].skins[punk.skinIndex].name,
      face: punk.face,
      traits: punk.picks.map((p) => ({ slot: p.trait.slot, id: p.trait.id, name: p.trait.name, color: p.swatch.name || undefined })),
    }
    download(`${fileBase()}.json`, new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  }
  $('copy-link').onclick = async (e) => {
    await navigator.clipboard.writeText(location.href)
    const b = e.target as HTMLButtonElement
    b.textContent = '已复制'
    setTimeout(() => (b.textContent = '链接'), 1200)
  }
  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return
    if (e.code === 'Space') {
      e.preventDefault()
      update({ seed: randomSeed() })
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const i = STYLES.findIndex((s) => s.id === state.style)
      const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + STYLES.length) % STYLES.length
      setStyle(STYLES[n].id)
    }
  })
}

readHash()
;($('size') as HTMLSelectElement).value = String(state.size)
bind()
update({})
