import { GrammarFactory } from './Grammar'
import { baseGrammar } from './baseGrammar'
import { FunctionParslet } from '../parslets/FunctionParslet'
import { NamePathParslet } from '../parslets/NamePathParslet'
import { KeyValueParslet } from '../parslets/KeyValueParslet'
import { TypeOfParslet } from '../parslets/TypeOfParslet'
import { VariadicParslet } from '../parslets/VariadicParslet'
import { NameParslet } from '../parslets/NameParslet'
import { ObjectParslet } from '../parslets/ObjectParslet'
import { SpecialNamePathParslet } from '../parslets/SpecialNamePathParslet'
import { SymbolParslet } from '../parslets/SymbolParslet'

export const closureGrammar: GrammarFactory = () => {
  const {
    prefixParslets,
    infixParslets
  } = baseGrammar()

  return {
    prefixParslets: [
      ...prefixParslets,
      new ObjectParslet({
        allowKeyTypes: false
      }),
      new NameParslet({
        allowedAdditionalTokens: ['event', 'external']
      }),
      new TypeOfParslet(),
      new FunctionParslet({
        allowWithoutParenthesis: false,
        allowNamedParameters: ['this', 'new'],
        allowNoReturnType: true
      }),
      new VariadicParslet({
        allowEnclosingBrackets: false
      }),
      new NameParslet({
        allowedAdditionalTokens: ['keyof']
      }),
      new SpecialNamePathParslet({
        allowedTypes: ['module']
      })
    ],
    infixParslets: [
      ...infixParslets,
      new NamePathParslet({
        allowJsdocNamePaths: true
      }),
      new KeyValueParslet({
        allowKeyTypes: false,
        allowOptional: false,
        allowReadonly: false
      }),
      new SymbolParslet()
    ]
  }
}
