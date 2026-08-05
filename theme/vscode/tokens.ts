import colors from '../semantic.js'
import { LAVENDERS } from '../palette.js'
import { token } from '../utils/index.js'

// The generic syntax tokens are themed here according to the Textmate naming
// convention and the package color semantics.
// See: http://manual.macromates.com/en/language_grammars#naming_conventions.html

//
// Generic syntax tokens
//

export const tokenColors = [
  // ℹ️ No color for generic <meta>, see naming conventions for details
  token('comment', colors.comment, { italic: true }),
  // Booleans are constants (Uppercase "constants" are actually variables)
  token('constant', colors.constant),
  // Entities end up being a lot of things, most noticably class names, method names
  token('entity', colors.entity),
  token('invalid', colors.invalid, { italic: true, bold: true, underline: true }),
  // Language keywords like `export` or `return`
  token('keyword', colors.keyword),
  // Generic for markup content
  token('markup', colors.markup),
  // Includes variable declarations
  token('storage', colors.storage),
  token('string', colors.string),
  // Support is meant to be things provided by external frameworks or libraries
  token('support', colors.support),
  token('variable', colors.variable),
  // Function/method parameters — italic for a softer, modern read
  token('variable.parameter', colors.variable, { italic: true }),
  // Language variables (this / self / super) — italic
  token('variable.language', colors.variable, { italic: true }),

  // --- TYPES
  {
    // General type match
    scope: 'support.type',
    settings: {
      fontStyle: 'italic',
      foreground: LAVENDERS[200],
    },
  },
  {
    // Highlight type assertions - TS "as"
    scope: 'keyword.control.as',
    settings: {
      fontStyle: 'bold underline',
      foreground: colors.typeAssertion,
    },
  },
  {
    // TS function assertions — bold to match the Lc 45 emphasized-text tier
    scope: 'keyword.operator.type.asserts, keyword.operator.expression.is',
    settings: {
      fontStyle: 'bold',
      foreground: colors.typeAssertion,
    },
  },
  {
    // Named types - covers type aliases, interfaces, and parameters
    scope: 'entity.name.type',
    settings: {
      foreground: LAVENDERS[500],
      fontStyle: 'italic',
    },
  },
]
