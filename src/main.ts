import {
  defaultOptions,
  drawPunk,
  type GenOptions,
  generate,
  KIND,
  KINDS,
  type Kind,
  type Punk,
  SLOT_NAMES,
  SLOTS,
  traitLabel,
  traitsFor,
} from './punk'
import { renderCanvas, renderSvg } from './render'
import { randomSeed } from './rng'
import { STYLE_BY_ID, STYLES } from './styles'
import { inTheme, THEME_BY_ID, THEMES, themeOf } from './themes'
import { TRAIT_BY_ID, type Slot } from './traits'

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
  if (THEME_BY_ID[q.get('th') ?? '']) state.opt.theme = q.get('th')!
  const k = q.get('k') as Kind | null
  if (k && KIND[k]) state.opt.kind = k
  if (q.get('sk')) state.opt.skin = Number(q.get('sk'))
  for (const s of SLOTS) if (q.get(s)) state.opt.slots[s] = q.get(s)!
  if (q.get('bg') === '0') state.background = false
}

function writeHash() {
  const q = new URLSearchParams({ s: state.seed, st: state.style })
  if (state.opt.theme !== 'none') q.set('th', state.opt.theme)
  if (state.opt.kind !== 'random') q.set('k', state.opt.kind)
  if (state.opt.skin !== 'random') q.set('sk', String(state.opt.skin))
  for (const s of SLOTS) if (state.opt.slots[s] !== 'random') q.set(s, state.opt.slots[s])
  if (!state.background) q.set('bg', '0')
  history.replaceState(null, '', `#${q}`)
}

const style = () => STYLE_BY_ID[state.style]
const kindSex = () => (state.opt.kind === 'random' ? undefined : KIND[state.opt.kind].sex)

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
  ($('seed') as HTMLInputElement).value = state.seed

  $('themes').replaceChildren(...THEMES.map((th) => chip(th.name, state.opt.theme === th.id, () => setTheme(th.id))))

  const theme = themeOf(state.opt.theme)
  const kinds = $('kinds')
  const kindList = KINDS.filter((k) => !Object.keys(theme.kinds).length || theme.kinds[k.id])
  kinds.replaceChildren(
    chip('随机', state.opt.kind === 'random', () => setKind('random')),
    ...kindList.map((k) => chip(k.name, state.opt.kind === k.id, () => setKind(k.id))),
  )

  const skins = KIND[state.opt.kind === 'random' ? 'male' : state.opt.kind].skins
  const mixed = `conic-gradient(${skins.map((s) => s.skin.s).join(',')})`
  $('skins').hidden = skins.length < 2
  $('skins').replaceChildren(
    swatchChip(mixed, state.opt.skin === 'random', () => update({ skin: 'random' })),
    ...skins.map((s, i) => swatchChip(s.skin.s, state.opt.skin === i, () => update({ skin: i }))),
  )

  const sex = kindSex()
  const slots = $('slots')
  slots.replaceChildren()
  for (const slot of SLOTS) {
    const pool = traitsFor(slot, sex, state.opt.theme)
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

function setTheme(id: string) {
  const th = themeOf(id)
  state.opt.theme = th.id
  state.style = th.style
  if (state.opt.kind !== 'random' && Object.keys(th.kinds).length && !th.kinds[state.opt.kind]) {
    state.opt.kind = 'random'
    state.opt.skin = 'random'
  }
  for (const s of SLOTS) {
    const t = TRAIT_BY_ID[state.opt.slots[s]]
    if (t && !inTheme(t, th)) state.opt.slots[s] = 'random'
  }
  update({})
}

function setKind(kind: Kind | 'random') {
  state.opt.kind = kind
  state.opt.skin = 'random'
  const sex = kindSex()
  for (const s of SLOTS) {
    const t = TRAIT_BY_ID[state.opt.slots[s]]
    if (t?.sex && sex && t.sex !== sex) state.opt.slots[s] = 'random'
  }
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
  const li = (text: string, slot?: Slot, id?: string) => {
    const el = document.createElement('li')
    el.textContent = text
    if (slot && id) {
      const locked = state.opt.slots[slot] === id
      el.classList.add('lockable')
      el.classList.toggle('locked', locked)
      el.onclick = () => setSlot(slot, locked ? 'random' : id)
    }
    attrs.append(el)
  }
  li(KIND[punk.kind].name)
  for (const pk of punk.picks) li(traitLabel(pk), pk.trait.slot, pk.trait.id)
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
      theme: punk.theme,
      type: punk.kind,
      skin: KIND[punk.kind].skins[punk.skinIndex].name,
      face: punk.face,
      attributes: punk.picks.map((p) => ({ slot: p.trait.slot, id: p.trait.id, name: p.trait.name, color: p.swatch.name || undefined })),
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
