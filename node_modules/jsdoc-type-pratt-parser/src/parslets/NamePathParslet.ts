import { InfixParslet } from './Parslet'
import { TokenType } from '../lexer/Token'
import { Precedence } from '../Precedence'
import { assertTerminal } from '../assertTypes'
import { Parser } from '../Parser'
import { IntermediateResult } from '../result/IntermediateResult'
import { NamePathResult, SpecialNamePath, TerminalResult } from '../result/TerminalResult'
import { PropertyResult } from '..'

interface NamePathParsletOptions {
  allowJsdocNamePaths: boolean
}

export class NamePathParslet implements InfixParslet {
  private readonly allowJsdocNamePaths: boolean
  private readonly allowedPropertyTokenTypes: TokenType[]

  constructor (opts: NamePathParsletOptions) {
    this.allowJsdocNamePaths = opts.allowJsdocNamePaths
    this.allowedPropertyTokenTypes = [
      'Identifier',
      'StringValue',
      'Number'
    ]
  }

  accepts (type: TokenType, next: TokenType): boolean {
    return (type === '.' && next !== '<') || (this.allowJsdocNamePaths && (type === '~' || type === '#'))
  }

  getPrecedence (): Precedence {
    return Precedence.NAME_PATH
  }

  parseInfix (parser: Parser, left: IntermediateResult): TerminalResult {
    let type: NamePathResult['pathType']

    if (parser.consume('.')) {
      type = 'property'
    } else if (parser.consume('~')) {
      type = 'inner'
    } else {
      parser.consume('#')
      type = 'instance'
    }

    let right: PropertyResult | SpecialNamePath<'event'> | undefined
    const tokenType = this.allowedPropertyTokenTypes.find(token => parser.getToken().type === token)
    if (tokenType !== undefined) {
      const value = parser.getToken().text
      parser.consume(tokenType)

      right = {
        type: 'JsdocTypeProperty',
        value: value
      }
    } else {
      const next = parser.parseIntermediateType(Precedence.NAME_PATH)
      if (next.type === 'JsdocTypeName' && next.value === 'event') {
        right = {
          type: 'JsdocTypeProperty',
          value: 'event'
        }
      } else if (next.type === 'JsdocTypeSpecialNamePath' && next.specialType === 'event') {
        right = next as SpecialNamePath<'event'>
      } else {
        const validTokens = this.allowedPropertyTokenTypes.join(', ')
        throw new Error(`Unexpected property value. Expecting token of type ${validTokens} or 'event' ` +
          `name path. Next token is of type: ${parser.getToken().type}`)
      }
    }

    return {
      type: 'JsdocTypeNamePath',
      left: assertTerminal(left),
      right,
      pathType: type
    }
  }
}
