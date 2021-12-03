import { InfixParslet } from './Parslet'
import { TokenType } from '../lexer/Token'
import { Precedence } from '../Precedence'
import { assertTerminal } from '../assertTypes'
import { Parser } from '../Parser'
import { IntermediateResult } from '../result/IntermediateResult'
import { TerminalResult } from '../result/TerminalResult'

export class ArrayBracketsParslet implements InfixParslet {
  accepts (type: TokenType, next: TokenType): boolean {
    return type === '[' && next === ']'
  }

  getPrecedence (): Precedence {
    return Precedence.ARRAY_BRACKETS
  }

  parseInfix (parser: Parser, left: IntermediateResult): TerminalResult {
    parser.consume('[')
    parser.consume(']')
    return {
      type: 'JsdocTypeGeneric',
      left: {
        type: 'JsdocTypeName',
        value: 'Array'
      },
      elements: [
        assertTerminal(left)
      ],
      meta: {
        brackets: 'square',
        dot: false
      }
    }
  }
}
