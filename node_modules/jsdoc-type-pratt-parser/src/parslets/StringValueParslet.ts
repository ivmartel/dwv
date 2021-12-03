import { PrefixParslet } from './Parslet'
import { TokenType } from '../lexer/Token'
import { Parser } from '../Parser'
import { Precedence } from '../Precedence'
import { StringValueResult } from '../result/TerminalResult'

export class StringValueParslet implements PrefixParslet {
  accepts (type: TokenType): boolean {
    return type === 'StringValue'
  }

  getPrecedence (): Precedence {
    return Precedence.PREFIX
  }

  parsePrefix (parser: Parser): StringValueResult {
    const token = parser.getToken()
    parser.consume('StringValue')
    return {
      type: 'JsdocTypeStringValue',
      value: token.text.slice(1, -1),
      meta: {
        quote: token.text[0] === '\'' ? 'single' : 'double'
      }
    }
  }
}
