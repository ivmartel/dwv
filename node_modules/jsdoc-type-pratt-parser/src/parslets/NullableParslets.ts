import { InfixParslet, PrefixParslet } from './Parslet'
import { TokenType } from '../lexer/Token'
import { Precedence } from '../Precedence'
import { isQuestionMarkUnknownType } from './isQuestionMarkUnkownType'
import { assertTerminal } from '../assertTypes'
import { Parser } from '../Parser'
import { IntermediateResult } from '../result/IntermediateResult'
import { TerminalResult } from '../result/TerminalResult'

export class NullablePrefixParslet implements PrefixParslet {
  accepts (type: TokenType, next: TokenType): boolean {
    return type === '?' && !isQuestionMarkUnknownType(next)
  }

  getPrecedence (): Precedence {
    return Precedence.NULLABLE
  }

  parsePrefix (parser: Parser): TerminalResult {
    parser.consume('?')
    return {
      type: 'JsdocTypeNullable',
      element: parser.parseType(Precedence.NULLABLE),
      meta: {
        position: 'prefix'
      }
    }
  }
}

export class NullableInfixParslet implements InfixParslet {
  accepts (type: TokenType, next: TokenType): boolean {
    return type === '?'
  }

  getPrecedence (): Precedence {
    return Precedence.NULLABLE
  }

  parseInfix (parser: Parser, left: IntermediateResult): TerminalResult {
    parser.consume('?')
    return {
      type: 'JsdocTypeNullable',
      element: assertTerminal(left),
      meta: {
        position: 'suffix'
      }
    }
  }
}
