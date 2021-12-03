import { InfixParslet, PrefixParslet } from '../parslets/Parslet'

export interface Grammar {
  prefixParslets: PrefixParslet[]
  infixParslets: InfixParslet[]
}

export type GrammarFactory = () => Grammar
