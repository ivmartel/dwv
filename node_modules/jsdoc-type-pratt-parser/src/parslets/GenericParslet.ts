import { TokenType } from '../lexer/Token'
import { InfixParslet } from './Parslet'
import { Precedence } from '../Precedence'
import { assertTerminal } from '../assertTypes'
import { Parser } from '../Parser'
import { IntermediateResult } from '../result/IntermediateResult'
import { TerminalResult } from '../result/TerminalResult'

export class GenericParslet implements InfixParslet {
  accepts (type: TokenType, next: TokenType): boolean {
    return type === '<' || (type === '.' && next === '<')
  }

  getPrecedence (): Precedence {
    return Precedence.GENERIC
  }

  parseInfix (parser: Parser, left: IntermediateResult): TerminalResult {
    const dot = parser.consume('.')
    parser.consume('<')

    const objects = []
    do {
      objects.push(parser.parseType(Precedence.PARAMETER_LIST))
    } while (parser.consume(','))

    if (!parser.consume('>')) {
      throw new Error('Unterminated generic parameter list')
    }

    return {
      type: 'JsdocTypeGeneric',
      left: assertTerminal(left),
      elements: objects,
      meta: {
        brackets: 'angle',
        dot
      }
    }
  }
}
