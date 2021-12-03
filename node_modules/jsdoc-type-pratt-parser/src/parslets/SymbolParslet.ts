import { InfixParslet } from './Parslet'
import { TokenType } from '../lexer/Token'
import { Precedence } from '../Precedence'
import { assertNumberOrVariadicName } from '../assertTypes'
import { Parser } from '../Parser'
import { IntermediateResult } from '../result/IntermediateResult'
import { SymbolResult, TerminalResult } from '../result/TerminalResult'

export class SymbolParslet implements InfixParslet {
  accepts (type: TokenType): boolean {
    return type === '('
  }

  getPrecedence (): Precedence {
    return Precedence.SYMBOL
  }

  parseInfix (parser: Parser, left: IntermediateResult): TerminalResult {
    if (left.type !== 'JsdocTypeName') {
      throw new Error('Symbol expects a name on the left side. (Reacting on \'(\')')
    }
    parser.consume('(')
    const result: SymbolResult = {
      type: 'JsdocTypeSymbol',
      value: left.value
    }
    if (!parser.consume(')')) {
      const next = parser.parseIntermediateType(Precedence.SYMBOL)
      result.element = assertNumberOrVariadicName(next)
      if (!parser.consume(')')) {
        throw new Error('Symbol does not end after value')
      }
    }

    return result
  }
}
