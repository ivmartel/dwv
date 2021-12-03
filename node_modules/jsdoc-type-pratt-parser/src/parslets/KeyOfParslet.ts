import { PrefixParslet } from './Parslet'
import { TokenType } from '../lexer/Token'
import { Parser } from '../Parser'
import { Precedence } from '../Precedence'
import { assertTerminal } from '../assertTypes'
import { KeyOfResult } from '../result/TerminalResult'

export class KeyOfParslet implements PrefixParslet {
  accepts (type: TokenType, next: TokenType): boolean {
    return type === 'keyof'
  }

  getPrecedence (): Precedence {
    return Precedence.KEY_OF_TYPE_OF
  }

  parsePrefix (parser: Parser): KeyOfResult {
    parser.consume('keyof')
    return {
      type: 'JsdocTypeKeyof',
      element: assertTerminal(parser.parseType(Precedence.KEY_OF_TYPE_OF))
    }
  }
}
