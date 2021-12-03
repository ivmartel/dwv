import { PrefixParslet } from './Parslet'
import { TokenType } from '../lexer/Token'
import { Precedence } from '../Precedence'
import { Parser } from '../Parser'
import { SpecialNamePath, SpecialNamePathType, TerminalResult } from '../result/TerminalResult'
import { moduleGrammar } from '../grammars/moduleGrammar'
import { assertTerminal } from '../assertTypes'

interface SpecialNamePathParsletOptions {
  allowedTypes: SpecialNamePathType[]
}

export class SpecialNamePathParslet implements PrefixParslet {
  private readonly allowedTypes: SpecialNamePathType[]

  constructor (opts: SpecialNamePathParsletOptions) {
    this.allowedTypes = opts.allowedTypes
  }

  accepts (type: TokenType, next: TokenType): boolean {
    return (this.allowedTypes as TokenType[]).includes(type)
  }

  getPrecedence (): Precedence {
    return Precedence.PREFIX
  }

  parsePrefix (parser: Parser): TerminalResult {
    const type = this.allowedTypes.find(type => parser.consume(type)) as SpecialNamePathType

    if (!parser.consume(':')) {
      return {
        type: 'JsdocTypeName',
        value: type
      }
    }

    const moduleParser = new Parser(moduleGrammar(), parser.getLexer())

    let result: SpecialNamePath

    let token = parser.getToken()
    if (parser.consume('StringValue')) {
      result = {
        type: 'JsdocTypeSpecialNamePath',
        value: token.text.slice(1, -1),
        specialType: type,
        meta: {
          quote: token.text[0] === '\'' ? 'single' : 'double'
        }
      }
    } else {
      let value = ''
      const allowed: TokenType[] = ['Identifier', '@', '/']
      while (allowed.some(type => parser.consume(type))) {
        value += token.text
        token = parser.getToken()
      }
      result = {
        type: 'JsdocTypeSpecialNamePath',
        value,
        specialType: type,
        meta: {
          quote: undefined
        }
      }
    }

    return assertTerminal(moduleParser.parseInfixIntermediateType(result, Precedence.ALL))
  }
}
