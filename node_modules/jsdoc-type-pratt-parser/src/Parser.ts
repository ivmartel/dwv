import { EarlyEndOfParseError, NoParsletFoundError } from './errors'
import { Token, TokenType } from './lexer/Token'
import { Lexer } from './lexer/Lexer'
import { InfixParslet, PrefixParslet } from './parslets/Parslet'
import { Grammar } from './grammars/Grammar'
import { assertTerminal } from './assertTypes'
import { Precedence } from './Precedence'
import { TerminalResult } from './result/TerminalResult'
import { IntermediateResult } from './result/IntermediateResult'

export class Parser {
  private readonly prefixParslets: PrefixParslet[]
  private readonly infixParslets: InfixParslet[]

  private readonly lexer: Lexer

  constructor (grammar: Grammar, lexer?: Lexer) {
    this.lexer = lexer ?? new Lexer()

    const {
      prefixParslets,
      infixParslets
    } = grammar

    this.prefixParslets = prefixParslets

    this.infixParslets = infixParslets
  }

  parseText (text: string): TerminalResult {
    this.lexer.lex(text)
    const result = this.parseType(Precedence.ALL)
    if (!this.consume('EOF')) {
      throw new EarlyEndOfParseError(this.getToken())
    }
    return result
  }

  getPrefixParslet (): PrefixParslet | undefined {
    return this.prefixParslets.find(p => p.accepts(this.getToken().type, this.peekToken().type))
  }

  getInfixParslet (precedence: Precedence): InfixParslet | undefined {
    return this.infixParslets.find(p => {
      return p.getPrecedence() > precedence && p.accepts(this.getToken().type, this.peekToken().type)
    })
  }

  public canParseType (): boolean {
    return this.getPrefixParslet() !== undefined
  }

  public parseType (precedence: Precedence): TerminalResult {
    return assertTerminal(this.parseIntermediateType(precedence))
  }

  public parseIntermediateType (precedence: Precedence): IntermediateResult {
    const parslet = this.getPrefixParslet()

    if (parslet === undefined) {
      throw new NoParsletFoundError(this.getToken())
    }

    const result = parslet.parsePrefix(this)

    return this.parseInfixIntermediateType(result, precedence)
  }

  public parseInfixIntermediateType (result: IntermediateResult, precedence: Precedence): IntermediateResult {
    let parslet = this.getInfixParslet(precedence)

    while (parslet !== undefined) {
      result = parslet.parseInfix(this, result)
      parslet = this.getInfixParslet(precedence)
    }

    return result
  }

  public consume (type: TokenType): boolean {
    if (this.lexer.token().type !== type) {
      return false
    }
    this.lexer.advance()
    return true
  }

  public getToken (): Token {
    return this.lexer.token()
  }

  public peekToken (): Token {
    return this.lexer.peek()
  }

  public previousToken (): Token | undefined {
    return this.lexer.last()
  }

  getLexer (): Lexer {
    return this.lexer
  }
}
