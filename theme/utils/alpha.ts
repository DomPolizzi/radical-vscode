import chroma from 'chroma-js'

export const alpha = (color: string, opacity: number): string =>
  chroma(color).alpha(opacity).hex()
