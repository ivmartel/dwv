import { Parser } from '../Parser'
import { TokenType } from '../lexer/Token'
import { PrefixParslet } from './Parslet'
import { Precedence } from '../Precedence'
import { NameResult } from '../result/TerminalResult'

interface NameParsletOptions {
  allowedAdditionalTokens: TokenType[]
}

export class NameParslet implements PrefixParslet {
  private readonly allowedAdditionalTokens: TokenType[]

  constructor (options: NameParsletOptions) {
    this.allowedAdditionalTokens = options.allowedAdditionalTokens
  }

  accepts (type: TokenType, next: TokenType): boolean {
    return type === 'Identifier' || type === 'this' || type === 'new' || this.allowedAdditionalTokens.includes(type)
  }

  getPrecedence (): Precedence {
    return Precedence.PREFIX
  }

  parsePrefix (parser: Parser): NameResult {
    const token = parser.getToken()
    parser.consume('Identifier') || parser.consume('this') || parser.consume('new') ||
      this.allowedAdditionalTokens.some(type => parser.consume(type))

    return {
      type: 'JsdocTypeName',
      value: token.text
    }
  }
}
