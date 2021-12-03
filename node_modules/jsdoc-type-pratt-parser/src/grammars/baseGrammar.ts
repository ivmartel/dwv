import { GrammarFactory } from './Grammar'
import { UnionParslet } from '../parslets/UnionParslets'
import { SpecialTypesParslet } from '../parslets/SpecialTypesParslet'
import { GenericParslet } from '../parslets/GenericParslet'
import { ParenthesisParslet } from '../parslets/ParenthesisParslet'
import { NumberParslet } from '../parslets/NumberParslet'
import { ParameterListParslet } from '../parslets/ParameterListParslet'
import { NullableInfixParslet, NullablePrefixParslet } from '../parslets/NullableParslets'
import { OptionalParslet } from '../parslets/OptionalParslet'
import { NotNullableParslet } from '../parslets/NotNullableParslet'

export const baseGrammar: GrammarFactory = () => {
  return {
    prefixParslets: [
      new NullablePrefixParslet(),
      new OptionalParslet(),
      new NumberParslet(),
      new ParenthesisParslet(),
      new SpecialTypesParslet(),
      new NotNullableParslet()
    ],
    infixParslets: [
      new ParameterListParslet({
        allowTrailingComma: true
      }),
      new GenericParslet(),
      new UnionParslet(),
      new OptionalParslet(),
      new NullableInfixParslet(),
      new NotNullableParslet()
    ]
  }
}
