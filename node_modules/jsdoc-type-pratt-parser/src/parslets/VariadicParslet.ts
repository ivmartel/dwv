import { InfixParslet, PrefixParslet } from './Parslet'
import { TokenType } from '../lexer/Token'
import { Precedence } from '../Precedence'
import { assertTerminal } from '../assertTypes'
import { Parser } from '../Parser'
import { TerminalResult, VariadicResult } from '../result/TerminalResult'
import { IntermediateResult } from '../result/IntermediateResult'

interface VariadicParsletOptions {
  allowEnclosingBrackets: boolean
}

export class VariadicParslet implements PrefixParslet, InfixParslet {
  private readonly allowEnclosingBrackets: boolean

  constructor (opts: VariadicParsletOptions) {
    this.allowEnclosingBrackets = opts.allowEnclosingBrackets
  }

  accepts (type: TokenType): boolean {
    return type === '...'
  }

  getPrecedence (): Precedence {
    return Precedence.PREFIX
  }

  parsePrefix (parser: Parser): VariadicResult<TerminalResult> {
    parser.consume('...')

    const brackets = this.allowEnclosingBrackets && parser.consume('[')

    if (!parser.canParseType()) {
      if (brackets) {
        throw new Error('Empty square brackets for variadic are not allowed.')
      }
      return {
        type: 'JsdocTypeVariadic',
        meta: {
          position: undefined,
          squareBrackets: false
        }
      }
    }

    const element = parser.parseType(Precedence.PREFIX)
    if (brackets && !parser.consume(']')) {
      throw new Error('Unterminated variadic type. Missing \']\'')
    }

    return {
      type: 'JsdocTypeVariadic',
      element: assertTerminal(element),
      meta: {
        position: 'prefix',
        squareBrackets: brackets
      }
    }
  }

  parseInfix (parser: Parser, left: IntermediateResult): TerminalResult {
    parser.consume('...')
    return {
      type: 'JsdocTypeVariadic',
      element: assertTerminal(left),
      meta: {
        position: 'suffix',
        squareBrackets: false
      }
    }
  }
}
