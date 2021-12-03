import { PrefixParslet } from './Parslet'
import { TokenType } from '../lexer/Token'
import { Precedence } from '../Precedence'
import { Parser } from '../Parser'
import { IntermediateResult } from '../result/IntermediateResult'

export class ReadonlyPropertyParslet implements PrefixParslet {
  accepts (type: TokenType, next: TokenType): boolean {
    return type === 'readonly'
  }

  getPrecedence (): Precedence {
    return Precedence.PREFIX
  }

  parsePrefix (parser: Parser): IntermediateResult {
    parser.consume('readonly')
    return {
      type: 'JsdocTypeReadonlyProperty',
      element: parser.parseType(Precedence.KEY_VALUE)
    }
  }
}
