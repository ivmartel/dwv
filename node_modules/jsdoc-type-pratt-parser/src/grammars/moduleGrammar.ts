import { GrammarFactory } from './Grammar'
import { SpecialNamePathParslet } from '../parslets/SpecialNamePathParslet'
import { NamePathParslet } from '../parslets/NamePathParslet'
import { NameParslet } from '../parslets/NameParslet'
import { NumberParslet } from '../parslets/NumberParslet'
import { StringValueParslet } from '../parslets/StringValueParslet'

export const moduleGrammar: GrammarFactory = () => ({
  prefixParslets: [
    new SpecialNamePathParslet({
      allowedTypes: ['event']
    }),
    new NameParslet({
      allowedAdditionalTokens: ['module', 'external']
    }),
    new NumberParslet(),
    new StringValueParslet()
  ],
  infixParslets: [
    new NamePathParslet({
      allowJsdocNamePaths: true
    })
  ]
})
