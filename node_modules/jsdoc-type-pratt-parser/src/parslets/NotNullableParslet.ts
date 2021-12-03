import { InfixParslet, PrefixParslet } from './Parslet'
import { TokenType } from '../lexer/Token'
import { Precedence } from '../Precedence'
import { assertTerminal } from '../assertTypes'
import { Parser } from '../Parser'
import { IntermediateResult } from '../result/IntermediateResult'
import { TerminalResult } from '../result/TerminalResult'

export class NotNullableParslet implements PrefixParslet, InfixParslet {
  accepts (type: TokenType, next: TokenType): boolean {
    return type === '!'
  }

  getPrecedence (): Precedence {
    return Precedence.NULLABLE
  }

  parsePrefix (parser: Parser): TerminalResult {
    parser.consume('!')
    return {
      type: 'JsdocTypeNotNullable',
      element: parser.parseType(Precedence.NULLABLE),
      meta: {
        position: 'prefix'
      }
    }
  }

  parseInfix (parser: Parser, left: IntermediateResult): TerminalResult {
    parser.consume('!')
    return {
      type: 'JsdocTypeNotNullable',
      element: assertTerminal(left),
      meta: {
        position: 'suffix'
      }
    }
  }
}
