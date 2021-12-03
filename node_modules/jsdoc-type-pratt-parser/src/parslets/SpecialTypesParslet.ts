import { PrefixParslet } from './Parslet'
import { TokenType } from '../lexer/Token'
import { Parser } from '../Parser'
import { Precedence } from '../Precedence'
import { isQuestionMarkUnknownType } from './isQuestionMarkUnkownType'
import { TerminalResult } from '../result/TerminalResult'

export class SpecialTypesParslet implements PrefixParslet {
  accepts (type: TokenType, next: TokenType): boolean {
    return (type === '?' && isQuestionMarkUnknownType(next)) || type === 'null' || type === 'undefined' || type === '*'
  }

  getPrecedence (): Precedence {
    return Precedence.SPECIAL_TYPES
  }

  parsePrefix (parser: Parser): TerminalResult {
    if (parser.consume('null')) {
      return {
        type: 'JsdocTypeNull'
      }
    }

    if (parser.consume('undefined')) {
      return {
        type: 'JsdocTypeUndefined'
      }
    }

    if (parser.consume('*')) {
      return {
        type: 'JsdocTypeAny'
      }
    }

    if (parser.consume('?')) {
      return {
        type: 'JsdocTypeUnknown'
      }
    }

    throw new Error('Unacceptable token: ' + parser.getToken().text)
  }
}
