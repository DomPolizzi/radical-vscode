import { BLUES, GRAYS, PINKS } from '../../palette.js'
import { token } from '../../utils/index.js'

export const comment = [
  // Documentation comment blocks
  token('comment.block.documentation', GRAYS[200]),
  token('string.quoted.docstring', GRAYS[200], { italic: true }), // same for Python

  // @tags for JSDoc
  token('comment.block.documentation storage', PINKS[100]),

  // {type} for JSDoc
  token('comment.block.documentation entity', GRAYS[500]),

  // name of JSDoc variables documentation
  token('variable.other.jsdoc', BLUES[100]),
]
