import { identityTransformRules } from './identityTransformRules'
import { transform } from './transform'
import { TerminalResult } from '../result/TerminalResult'

const simplifyRules = identityTransformRules()

// remove parenthesis
simplifyRules.JsdocTypeParenthesis = (result, transform) => transform(result.element)

// remove squares around variadic parameters
const identityVariadic = simplifyRules.JsdocTypeVariadic
simplifyRules.JsdocTypeVariadic = (result, transform) => {
  result.meta.squareBrackets = false
  return identityVariadic(result, transform)
}

export function simplify (result: TerminalResult): TerminalResult {
  return transform(simplifyRules, result) as TerminalResult
}
