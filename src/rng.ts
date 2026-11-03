export type Rng = () => number

export function hashSeed(s: string): number {
  let h = 1779033703 ^ s.length
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  return (h ^= h >>> 16) >>> 0
}

export function makeRng(seed: string): Rng {
  let a = hashSeed(seed)
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 按权重抽取, 无论池子是否为空都只消耗一次随机数, 保证随机流稳定 */
export function weighted<T extends { weight: number }>(rng: Rng, pool: T[]): T | undefined {
  const r = rng()
  const total = pool.reduce((s, x) => s + x.weight, 0)
  let acc = r * total
  for (const x of pool) {
    acc -= x.weight
    if (acc < 0) return x
  }
  return pool[pool.length - 1]
}

export function randomSeed(): string {
  return Math.random().toString(36).slice(2, 8)
}
