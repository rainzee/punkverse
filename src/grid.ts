import { over, parse } from './color'

export const SIZE = 24

export type Hex = string

/** 24×24 像素画布, 半透明颜色会与已有像素混合 */
export class Grid {
  cells: (Hex | null)[] = new Array(SIZE * SIZE).fill(null)

  inside(x: number, y: number) {
    return x >= 0 && y >= 0 && x < SIZE && y < SIZE
  }

  get(x: number, y: number): Hex | null {
    return this.inside(x, y) ? this.cells[y * SIZE + x] : null
  }

  set(x: number, y: number, c: Hex | null) {
    if (!this.inside(x, y)) return
    const i = y * SIZE + x
    const prev = this.cells[i]
    this.cells[i] = c && prev && parse(c).a < 1 ? over(c, prev) : c
  }

  rect(x: number, y: number, w: number, h: number, c: Hex | null) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c)
  }

  hline(y: number, x0: number, x1: number, c: Hex | null) {
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) this.set(x, y, c)
  }

  vline(x: number, y0: number, y1: number, c: Hex | null) {
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) this.set(x, y, c)
  }

  /** 用字符画绘制, 调色板中不存在的字符视为透明 */
  sprite(x0: number, y0: number, rows: string[], palette: Record<string, Hex>) {
    rows.forEach((row, j) => {
      ;[...row].forEach((ch, i) => {
        const c = palette[ch]
        if (c) this.set(x0 + i, y0 + j, c)
      })
    })
  }

  stamp(other: Grid) {
    other.cells.forEach((c, i) => {
      if (c) this.set(i % SIZE, Math.floor(i / SIZE), c)
    })
  }
}

/** 在临时图层上绘制形状, 然后为其加上 1px 描边再合并回主画布 */
export function withOutline(
  g: Grid,
  color: Hex,
  draw: (layer: Grid) => void,
  skip?: (x: number, y: number) => boolean,
) {
  const layer = new Grid()
  draw(layer)
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (layer.get(x, y) || skip?.(x, y)) continue
      const near = layer.get(x - 1, y) || layer.get(x + 1, y) || layer.get(x, y - 1) || layer.get(x, y + 1)
      if (near) g.set(x, y, color)
    }
  }
  g.stamp(layer)
}
