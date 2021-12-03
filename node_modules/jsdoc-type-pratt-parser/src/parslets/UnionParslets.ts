import { InfixParslet } from './Parslet'
import { TokenType } from '../lexer/Token'
import { Precedence } from '../Precedence'
import { assertTerminal } from '../assertTypes'
import { Parser } from '../Parser'
import { IntermediateResult } from '../result/IntermediateResult'
import { TerminalResult } from '../result/TerminalResult'

export class UnionParslet implements InfixParslet {
  accepts (type: TokenType): boolean {
    return type === '|'
  }

  getPrecedence (): Precedence {
    return Precedence.UNION
  }

  parseInfix (parser: Parser, left: IntermediateResult): TerminalResult {
    parser.consume('|')

    const elements = []
    do {
      elements.push(parser.parseType(Precedence.UNION))
    } while (parser.consume('|'))

    return {
      type: 'JsdocTypeUnion',
      elements: [assertTerminal(left), ...elements]
    }
  }
}
