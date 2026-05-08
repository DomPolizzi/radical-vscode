import { token } from '../../utils/index.js'
import { PINKS } from '../../palette.js'

export const html = [
  // Match pink "=" from JSX for HTML attributes
  token('punctuation.separator.key-value.html', PINKS[200]),
  token('meta.tag.structure.any.html, meta.tag.inline.any.html', PINKS[200]), // same for Nunjucks
]
