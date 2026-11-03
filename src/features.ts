import { alpha, mix, shade } from './color'
import type { Grid } from './grid'
import type { Rng } from './rng'
import type { Anchors, SkinPalette } from './traits'

const K = '#000000'
const W = '#ffffff'

/** 五官形态, 每项为变体序号, 0 为原版样式 */
export interface FaceShape {
  brow: number
  eye: number
  nose: number
  mouth: number
  line: number
  iris: number
}

const IRIS = ['#2a6fe0', '#2e9e5b', '#8a5a2b', '#7a7a7a']

/** 第一项为原版样式的权重, 其余变体平分剩余概率 */
function variant(rng: Rng, count: number, base: number): number {
  const r = rng()
  return r < base ? 0 : 1 + Math.floor(((r - base) / (1 - base)) * (count - 1))
}

export function rollFace(rng: Rng): FaceShape {
  return {
    brow: variant(rng, 5, 0.4),
    eye: variant(rng, 5, 0.5),
    nose: variant(rng, 5, 0.45),
    mouth: variant(rng, 4, 0.5),
    line: variant(rng, 4, 0.6),
    iris: Math.floor(rng() * IRIS.length),
  }
}

/** 在基础头型上应用五官变体, 只改动锚点附近的像素 */
export function shapeFace(g: Grid, a: Anchors, skin: SkinPalette, f: FaceShape) {
  const Y = a.eyeY
  const eyes = [a.eyeL, a.eyeR]
  const brow = shade(skin.d, 0.6)

  if (f.brow > 0) for (const e of eyes) g.hline(Y - 1, e, e + 1, skin.s)
  if (f.brow === 2) {
    g.hline(Y - 1, a.eyeL - 1, a.eyeL + 1, brow)
    g.hline(Y - 1, a.eyeR, a.eyeR + 2, brow)
  }
  if (f.brow === 3) {
    g.set(a.eyeL, Y - 2, skin.d)
    g.set(a.eyeL + 1, Y - 1, skin.d)
    g.set(a.eyeR, Y - 1, skin.d)
    g.set(a.eyeR + 1, Y - 2, skin.d)
  }
  if (f.brow === 4) for (const e of eyes) g.hline(Y - 2, e, e + 1, skin.d)

  for (const e of eyes) {
    if (f.eye === 1) g.set(e, Y, W)
    if (f.eye === 2) {
      g.set(e, Y, skin.d)
      g.hline(Y - 1, e, e + 1, skin.d)
    }
    if (f.eye === 3) g.set(e, Y, skin.s)
    if (f.eye === 4) {
      g.set(e, Y, W)
      g.set(e + 1, Y, IRIS[f.iris])
    }
  }

  if (f.nose === 1) g.set(a.noseX, Y + 4, skin.d)
  if (f.nose === 2) g.set(a.noseX + 1, Y + 3, skin.d)
  if (f.nose === 3) g.set(a.noseX, Y + 2, skin.s)
  if (f.nose === 4) {
    g.set(a.noseX - 1, Y + 3, skin.d)
    g.set(a.noseX + 1, Y + 3, skin.d)
  }

  if (f.mouth === 1) g.set(a.mouthL, a.mouthY, skin.s)
  if (f.mouth === 2) g.set(a.mouthL - 1, a.mouthY, skin.m)
  if (f.mouth === 3) g.set(a.mouthL + 1, a.mouthY + 1, mix(skin.m, skin.s, 0.4))

  const soft = alpha(skin.d, 0.55)
  if (f.line === 1) g.vline(a.mouthL - 2, a.mouthY - 1, a.mouthY, soft)
  if (f.line === 2) for (const e of eyes) g.hline(Y + 1, e, e + 1, soft)
  if (f.line === 3) g.vline(a.L + 1, Y + 2, Y + 3, soft)
}

export function decorateApe(g: Grid, a: Anchors, skin: SkinPalette) {
  for (let y = a.eyeY + 2; y <= a.chinY; y++)
    for (let x = a.mouthL - 2; x <= a.R; x++) if (a.face(x, y)) g.set(x, y, mix(skin.s, W, 0.25))
  g.hline(a.eyeY - 1, a.L, a.R, skin.d)
  g.hline(a.eyeY + 2, a.noseX, a.noseX + 1, K)
  g.hline(a.mouthY, a.mouthL, a.mouthR, skin.m)
}

export function decorateAlien(g: Grid, a: Anchors, skin: SkinPalette) {
  g.hline(a.eyeY - 1, a.L, a.R, skin.s)
  g.set(a.eyeL, a.eyeY, K)
  g.set(a.eyeR, a.eyeY, K)
}

export function decorateRobot(g: Grid, a: Anchors, skin: SkinPalette) {
  g.vline(12, a.top - 3, a.top - 2, skin.d)
  g.set(12, a.top - 4, '#ff3355')
  g.set(a.L + 1, a.top + 1, skin.d)
  g.set(a.R - 1, a.top + 1, skin.d)
  g.hline(a.eyeY - 1, a.L, a.R, skin.s)
  g.hline(a.eyeY, a.eyeL - 1, a.eyeR + 2, K)
  for (const e of [a.eyeL, a.eyeR]) g.hline(a.eyeY, e, e + 1, skin.p)
  g.vline(a.noseX, a.eyeY + 2, a.eyeY + 3, skin.s)
  for (let x = a.mouthL - 1; x <= a.mouthR + 1; x++) g.set(x, a.mouthY, x % 2 ? skin.m : skin.d)
  g.set(a.earX, a.eyeY + 1, '#555555')
  for (let y = a.chinY + 1; y < 24; y++) g.hline(y, a.L, a.L + 4, y % 2 ? skin.d : skin.s)
}

export function decorateSkeleton(g: Grid, a: Anchors, skin: SkinPalette) {
  for (const e of [a.eyeL, a.eyeR]) {
    g.hline(a.eyeY - 1, e, e + 1, skin.s)
    g.rect(e, a.eyeY, 2, 2, K)
  }
  g.vline(a.noseX, a.eyeY + 2, a.eyeY + 3, K)
  for (let x = a.mouthL - 2; x <= a.mouthR + 1; x++) {
    g.set(x, a.mouthY, x % 2 ? K : W)
    g.set(x, a.mouthY + 1, K)
  }
  g.vline(a.L + 1, a.eyeY + 3, a.eyeY + 4, skin.d)
  for (let y = a.chinY + 1; y < 24; y++) g.hline(y, a.L + 1, a.L + 3, y % 2 ? skin.d : skin.s)
}

export function decorateDemon(g: Grid, a: Anchors) {
  const horn = '#efe3c2'
  g.set(a.L + 1, a.top - 1, horn)
  g.set(a.L, a.top - 2, horn)
  g.set(a.R - 1, a.top - 1, horn)
  g.set(a.R, a.top - 2, horn)
  g.set(a.mouthL, a.mouthY + 1, W)
  g.set(a.mouthR, a.mouthY + 1, W)
}
