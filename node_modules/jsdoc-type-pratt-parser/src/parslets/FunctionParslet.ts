import { PrefixParslet } from './Parslet'
import { TokenType } from '../lexer/Token'
import { Parser } from '../Parser'
import { Precedence } from '../Precedence'
import { BaseFunctionParslet } from './BaseFunctionParslet'
import { FunctionResult, TerminalResult } from '../result/TerminalResult'

export interface FunctionParsletOptions {
  allowNamedParameters?: string[]
  allowWithoutParenthesis: boolean
  allowNoReturnType: boolean
}

export class FunctionParslet extends BaseFunctionParslet implements PrefixParslet {
  private readonly allowWithoutParenthesis: boolean
  private readonly allowNamedParameters?: string[]
  private readonly allowNoReturnType: boolean

  constructor (options: FunctionParsletOptions) {
    super()
    this.allowWithoutParenthesis = options.allowWithoutParenthesis
    this.allowNamedParameters = options.allowNamedParameters
    this.allowNoReturnType = options.allowNoReturnType
  }

  accepts (type: TokenType): boolean {
    return type === 'function'
  }

  getPrecedence (): Precedence {
    return Precedence.FUNCTION
  }

  parsePrefix (parser: Parser): TerminalResult {
    parser.consume('function')

    const hasParenthesis = parser.getToken().type === '('

    if (!hasParenthesis) {
      if (!this.allowWithoutParenthesis) {
        throw new Error('function is missing parameter list')
      }

      return {
        type: 'JsdocTypeName',
        value: 'function'
      }
    }

    const result: FunctionResult = {
      type: 'JsdocTypeFunction',
      parameters: [],
      arrow: false,
      parenthesis: hasParenthesis
    }

    const value = parser.parseIntermediateType(Precedence.FUNCTION)

    if (this.allowNamedParameters === undefined) {
      result.parameters = this.getUnnamedParameters(value)
    } else {
      result.parameters = this.getParameters(value)
      for (const p of result.parameters) {
        if (p.type === 'JsdocTypeKeyValue' && (!this.allowNamedParameters.includes(p.key) || p.meta.quote !== undefined)) {
          throw new Error(`only allowed named parameters are ${this.allowNamedParameters.join(',')} but got ${p.type}`)
        }
      }
    }

    if (parser.consume(':')) {
      result.returnType = parser.parseType(Precedence.PREFIX)
    } else {
      if (!this.allowNoReturnType) {
        throw new Error('function is missing return type')
      }
    }

    return result
  }
}
