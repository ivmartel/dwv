import { PrefixParslet } from './Parslet'
import { TokenType } from '../lexer/Token'
import { Parser } from '../Parser'
import { Precedence } from '../Precedence'
import { assertTerminal } from '../assertTypes'
import { TypeOfResult } from '../result/TerminalResult'

export class TypeOfParslet implements PrefixParslet {
  accepts (type: TokenType, next: TokenType): boolean {
    return type === 'typeof'
  }

  getPrecedence (): Precedence {
    return Precedence.KEY_OF_TYPE_OF
  }

  parsePrefix (parser: Parser): TypeOfResult {
    parser.consume('typeof')
    return {
      type: 'JsdocTypeTypeof',
      element: assertTerminal(parser.parseType(Precedence.KEY_OF_TYPE_OF))
    }
  }
}
