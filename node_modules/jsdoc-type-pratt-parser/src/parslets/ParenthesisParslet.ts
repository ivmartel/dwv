import { PrefixParslet } from './Parslet'
import { TokenType } from '../lexer/Token'
import { Precedence } from '../Precedence'
import { assertTerminal, isPlainKeyValue } from '../assertTypes'
import { Parser } from '../Parser'
import { ParenthesisResult } from '../result/TerminalResult'
import { ParameterList } from '../result/IntermediateResult'

export class ParenthesisParslet implements PrefixParslet {
  accepts (type: TokenType, next: TokenType): boolean {
    return type === '('
  }

  getPrecedence (): Precedence {
    return Precedence.PARENTHESIS
  }

  parsePrefix (parser: Parser): ParenthesisResult | ParameterList {
    parser.consume('(')
    if (parser.consume(')')) {
      return {
        type: 'JsdocTypeParameterList',
        elements: []
      }
    }
    const result = parser.parseIntermediateType(Precedence.ALL)
    if (!parser.consume(')')) {
      throw new Error('Unterminated parenthesis')
    }
    if (result.type === 'JsdocTypeParameterList') {
      return result
    } else if (result.type === 'JsdocTypeKeyValue' && isPlainKeyValue(result)) {
      return {
        type: 'JsdocTypeParameterList',
        elements: [result]
      }
    }
    return {
      type: 'JsdocTypeParenthesis',
      element: assertTerminal(result)
    }
  }
}
